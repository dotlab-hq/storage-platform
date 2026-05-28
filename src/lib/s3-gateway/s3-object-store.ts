import {
  HeadObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { Readable } from 'node:stream'
import type { BucketContext } from '@/lib/s3-gateway/s3-context'
import {
  isStatusMetadataError,
  normalizeETag,
  shouldReturnNotModified,
} from '@/lib/s3-gateway/s3-conditional-cache'
import { findStoredObject } from '@/lib/s3-gateway/s3-stored-object'
import type { ObjectConditionalHeaders } from '@/lib/s3-gateway/s3-conditional-cache'
import {
  getProviderClientById,
  selectProviderForUpload,
} from '@/lib/s3-provider-client'
import { and, eq, isNull, like } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder, userStorage } from '@/db/schema/storage'
import {
  ProviderRequestTimeoutError,
  sendWithProviderTimeout,
} from './s3-provider-timeout'
import { upsertCommittedFile } from './upload-file-records'
import { buildUpstreamObjectKey, deriveFileName } from './upload-key-utils'
import { resolveVirtualFolder, splitObjectKey } from './virtual-fs'
import { listObjectsByBtree } from '@/lib/storage-btree/list'
import { backfillStorageBtree } from '@/lib/storage-btree/backfill'
import { deleteNodeByEntity } from '@/lib/storage-btree/index'
import { patchQuotaUsedStorage } from '@/lib/cache-invalidation'

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback
  }
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const PROVIDER_METADATA_HEAD_TIMEOUT_MS = parsePositiveInt(
  process.env.S3_PROVIDER_METADATA_HEAD_TIMEOUT_MS,
  4000,
)

async function* streamWebChunks(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<Uint8Array> {
  const reader = stream.getReader()
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) {
        return
      }
      yield value
    }
  } finally {
    reader.releaseLock()
  }
}

function toNodeReadable(stream: ReadableStream<Uint8Array>): Readable {
  return Readable.from(streamWebChunks(stream))
}

function upstreamKeyFor(bucket: BucketContext, objectKey: string): string {
  return buildUpstreamObjectKey(
    bucket.userId,
    bucket.bucketId,
    bucket.mappedFolderId,
    objectKey,
  )
}

export type ListedS3Object = {
  key: string
  size: number
  eTag: string | null
  lastModified: Date
}

type ParsedRange = {
  start: number
  end: number
}

function parseRangeHeader(
  rangeHeader: string | null,
  totalLength: number,
): ParsedRange | 'invalid' | 'unsatisfiable' | null {
  if (!rangeHeader) {
    return null
  }
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader)
  if (!match) {
    return 'invalid'
  }
  const startRaw = match[1]
  const endRaw = match[2]
  if (!startRaw && !endRaw) {
    return 'invalid'
  }
  if (!Number.isFinite(totalLength) || totalLength < 0) {
    return 'invalid'
  }
  if (totalLength === 0) {
    return 'unsatisfiable'
  }

  if (!startRaw) {
    const suffixLength = Number.parseInt(endRaw, 10)
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) {
      return 'invalid'
    }
    const length = Math.min(suffixLength, totalLength)
    return {
      start: totalLength - length,
      end: totalLength - 1,
    }
  }

  const start = Number.parseInt(startRaw, 10)
  if (!Number.isFinite(start) || start < 0) {
    return 'invalid'
  }
  if (start >= totalLength) {
    return 'unsatisfiable'
  }

  let end = totalLength - 1
  if (endRaw) {
    const parsedEnd = Number.parseInt(endRaw, 10)
    if (!Number.isFinite(parsedEnd) || parsedEnd < 0) {
      return 'invalid'
    }
    end = Math.min(parsedEnd, totalLength - 1)
  }
  if (end < start) {
    return 'invalid'
  }
  return { start, end }
}

async function hasBucketObjects(bucket: BucketContext): Promise<boolean> {
  try {
    const objectKeyPrefix = `s3/${bucket.userId}/${bucket.bucketId}/%`
    const rows = await db
      .select({ id: file.id })
      .from(file)
      .where(
        and(
          eq(file.userId, bucket.userId),
          eq(file.isDeleted, false),
          eq(file.isTrashed, false),
          like(file.objectKey, objectKeyPrefix),
        ),
      )
      .limit(1)
    return rows.length > 0
  } catch (error) {
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : 'Unknown hasBucketObjects query error'
    console.warn(
      '[S3 Gateway] hasBucketObjects fallback to backfill/traversal due to schema mismatch:',
      message,
    )
    return true
  }
}

export async function listObjectsV2(
  bucket: BucketContext,
  prefix: string,
): Promise<ListedS3Object[]> {
  const btreeResults = await listObjectsByBtree({
    userId: bucket.userId,
    mappedFolderId: bucket.mappedFolderId,
    prefix,
  })
  if (btreeResults.length > 0) {
    return btreeResults
  }

  if (!(await hasBucketObjects(bucket))) {
    return []
  }

  await backfillStorageBtree(bucket.userId)
  const btreeAfterBackfill = await listObjectsByBtree({
    userId: bucket.userId,
    mappedFolderId: bucket.mappedFolderId,
    prefix,
  })
  if (btreeAfterBackfill.length > 0) {
    return btreeAfterBackfill
  }

  const results: ListedS3Object[] = []

  const visited = new Set<string>()
  const queue: Array<{
    folderId: string | null
    path: string
    updatedAt?: Date
  }> = [{ folderId: bucket.mappedFolderId, path: '' }]

  while (queue.length > 0) {
    const current = queue.shift()!
    if (current.folderId && visited.has(current.folderId)) {
      continue
    }
    if (current.folderId) {
      visited.add(current.folderId)
    }

    const folderCondition = current.folderId
      ? eq(folder.parentFolderId, current.folderId)
      : isNull(folder.parentFolderId)

    const childFolders = await db
      .select({
        id: folder.id,
        name: folder.name,
        updatedAt: folder.updatedAt,
      })
      .from(folder)
      .where(
        and(
          eq(folder.userId, bucket.userId),
          eq(folder.isDeleted, false),
          eq(folder.isTrashed, false),
          folderCondition,
        ),
      )

    const fileCondition = current.folderId
      ? eq(file.folderId, current.folderId)
      : isNull(file.folderId)

    const childFiles = await db
      .select({
        name: file.name,
        sizeInBytes: file.sizeInBytes,
        etag: file.etag,
        lastModified: file.lastModified,
        updatedAt: file.updatedAt,
      })
      .from(file)
      .where(
        and(
          eq(file.userId, bucket.userId),
          eq(file.isDeleted, false),
          eq(file.isTrashed, false),
          fileCondition,
        ),
      )

    if (childFolders.length === 0 && childFiles.length === 0 && current.path) {
      const matchPrefix =
        current.path.startsWith(prefix) ||
        prefix === current.path ||
        prefix === current.path + '/'
      if (matchPrefix) {
        results.push({
          key: current.path + '/',
          size: 0,
          eTag: null,
          lastModified: current.updatedAt ?? new Date(0),
        })
      }
    }

    for (const f of childFolders) {
      const newPath = current.path ? `${current.path}/${f.name}` : f.name
      if (
        prefix.startsWith(newPath + '/') ||
        newPath.startsWith(prefix) ||
        prefix === newPath ||
        prefix === ''
      ) {
        queue.push({ folderId: f.id, path: newPath, updatedAt: f.updatedAt })
      }
    }

    for (const f of childFiles) {
      const newPath = current.path ? `${current.path}/${f.name}` : f.name
      if (newPath.startsWith(prefix)) {
        results.push({
          key: newPath,
          size: f.sizeInBytes,
          eTag: f.etag,
          lastModified: f.lastModified ?? f.updatedAt ?? new Date(0),
        })
      }
    }
  }

  return results
}

export async function putObject(
  bucket: BucketContext,
  objectKey: string,
  body: ReadableStream<Uint8Array>,
  contentType: string | null,
  contentLength: number | null,
  metadataInput?: {
    cacheControl: string | null
    contentDisposition: string | null
    contentEncoding: string | null
    contentLanguage: string | null
    metadata: Record<string, string>
  },
): Promise<string | null> {
  const { folderPath, fileName, isDirectory } = splitObjectKey(objectKey)

  // Resolve the destination folder ID
  const targetFolderId = await resolveVirtualFolder(
    bucket.userId,
    bucket.mappedFolderId,
    folderPath,
  )

  if (isDirectory) {
    // Just create the directory structure, do not upload to S3
    return '"empty-dir"'
  }

  const provider = await selectProviderForUpload(
    contentLength ?? 0,
    bucket.userId,
  )
  const upstreamKey = buildUpstreamObjectKey(
    bucket.userId,
    bucket.bucketId,
    targetFolderId,
    objectKey,
  )
  const result = await sendWithProviderTimeout((abortSignal) =>
    provider.client.send(
      new PutObjectCommand({
        Bucket: provider.bucketName,
        Key: upstreamKey,
        Body: toNodeReadable(body),
        ContentType: contentType ?? 'application/octet-stream',
        CacheControl: metadataInput?.cacheControl ?? undefined,
        ContentDisposition: metadataInput?.contentDisposition ?? undefined,
        ContentEncoding: metadataInput?.contentEncoding ?? undefined,
        ContentLanguage: metadataInput?.contentLanguage ?? undefined,
        Metadata:
          metadataInput && Object.keys(metadataInput.metadata).length > 0
            ? metadataInput.metadata
            : undefined,
        ContentLength: contentLength ?? undefined,
      }),
      { abortSignal },
    ),
  )

  let metadataETag: string | undefined
  let metadataCacheControl: string | undefined
  let metadataLastModified: Date | undefined
  let metadataContentLength: number | undefined
  let metadataTimer: ReturnType<typeof setTimeout> | null = null
  try {
    const metadataAbortController = new AbortController()
    metadataTimer = setTimeout(
      () => metadataAbortController.abort(),
      PROVIDER_METADATA_HEAD_TIMEOUT_MS,
    )
    const metadata = await provider.client.send(
      new HeadObjectCommand({
        Bucket: provider.bucketName,
        Key: upstreamKey,
      }),
      { abortSignal: metadataAbortController.signal },
    )
    metadataETag = metadata.ETag
    metadataCacheControl = metadata.CacheControl
    metadataLastModified = metadata.LastModified
    metadataContentLength =
      typeof metadata.ContentLength === 'number'
        ? metadata.ContentLength
        : undefined
  } catch (error) {
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : 'Unknown provider metadata error'
    console.warn(
      '[S3 Gateway] Non-fatal HeadObject metadata fetch failure after PUT:',
      message,
    )
  } finally {
    if (metadataTimer) {
      clearTimeout(metadataTimer)
    }
  }

  await upsertCommittedFile({
    userId: bucket.userId,
    providerId: provider.providerId,
    objectKey: upstreamKey,
    contentType,
    mappedFolderId: targetFolderId,
    fileName: fileName || deriveFileName(objectKey),
    sizeInBytes: metadataContentLength ?? contentLength ?? 0,
    // Prefer HEAD metadata ETag because provider PutObject responses may omit ETag in some configurations.
    etag: resolvePersistedETag(metadataETag, result.ETag),
    cacheControl: metadataCacheControl ?? null,
    lastModified: metadataLastModified ?? new Date(),
  })

  return result.ETag ?? null
}

function copySourcePath(bucketName: string, key: string): string {
  const encodedKey = key
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
  return `/${bucketName}/${encodedKey}`
}

function toProviderPutBody(
  body: unknown,
): Readable | ReadableStream<Uint8Array> {
  if (body instanceof ReadableStream) {
    return toNodeReadable(body)
  }
  if (
    typeof body === 'object' &&
    body !== null &&
    'transformToWebStream' in body &&
    typeof (body as { transformToWebStream?: unknown }).transformToWebStream ===
      'function'
  ) {
    const webStream = (
      body as { transformToWebStream: () => ReadableStream<Uint8Array> }
    ).transformToWebStream()
    return toNodeReadable(webStream)
  }
  throw new Error('Unsupported provider response body for copy fallback')
}

function toBodyInit(body: unknown): BodyInit | null {
  if (body === null || body === undefined) {
    return null
  }
  if (
    body instanceof ReadableStream ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    typeof body === 'string' ||
    body instanceof URLSearchParams ||
    body instanceof FormData
  ) {
    return body
  }
  if (
    typeof body === 'object' &&
    'transformToWebStream' in body &&
    typeof (body as { transformToWebStream?: unknown }).transformToWebStream ===
      'function'
  ) {
    return (
      body as { transformToWebStream: () => ReadableStream<Uint8Array> }
    ).transformToWebStream()
  }
  if (body instanceof Readable) {
    const withToWeb = Readable as typeof Readable & {
      toWeb?: (stream: Readable) => ReadableStream<Uint8Array>
    }
    if (typeof withToWeb.toWeb === 'function') {
      return withToWeb.toWeb(body)
    }
    return nodeReadableToWebStream(body)
  }
  if (body instanceof Uint8Array) {
    const cloned = new Uint8Array(body.byteLength)
    cloned.set(body)
    return cloned.buffer
  }
  return null
}

function normalizeReadableChunk(value: Uint8Array | string): Uint8Array {
  if (typeof value === 'string') {
    return new TextEncoder().encode(value)
  }
  if (value.byteOffset === 0 && value.byteLength === value.buffer.byteLength) {
    return value
  }
  const copy = new Uint8Array(value.byteLength)
  copy.set(value)
  return copy
}

function nodeReadableToWebStream(stream: Readable): ReadableStream<Uint8Array> {
  const iterator = stream[Symbol.asyncIterator]() as AsyncIterator<
    Uint8Array | string
  >
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const result = await iterator.next()
      if (result.done) {
        controller.close()
        return
      }
      controller.enqueue(normalizeReadableChunk(result.value))
    },
    async cancel(reason) {
      if (iterator.return) {
        await iterator.return()
      }
      stream.destroy(reason instanceof Error ? reason : undefined)
    },
  })
}

/**
 * Persists ETag with provider HEAD result taking precedence over PUT response ETag.
 * Some providers omit ETag on PUT, while HEAD is more reliable after object commit.
 */
function resolvePersistedETag(
  metadataETag: string | undefined,
  putResultETag: string | undefined,
): string | null {
  if (metadataETag !== undefined) return normalizeETag(metadataETag)
  if (putResultETag !== undefined) return normalizeETag(putResultETag)
  return null
}

async function softDeleteMissingStoredObject(input: {
  userId: string
  upstreamObjectKey: string
}): Promise<void> {
  await db
    .update(file)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
    })
    .where(
      and(
        eq(file.userId, input.userId),
        eq(file.objectKey, input.upstreamObjectKey),
        eq(file.isDeleted, false),
        eq(file.isTrashed, false),
      ),
    )
}

export async function getObject(
  bucket: BucketContext,
  objectKey: string,
  conditionals: ObjectConditionalHeaders,
  rangeHeader: string | null,
): Promise<Response | null> {
  const stored = await findStoredObject(bucket, objectKey)
  if (!stored) {
    return null
  }

  const effectiveLastModified = stored.lastModified ?? stored.updatedAt
  const should304 = shouldReturnNotModified({
    eTag: stored.etag,
    lastModified: effectiveLastModified,
    ifNoneMatch: conditionals.ifNoneMatch,
    ifModifiedSince: conditionals.ifModifiedSince,
  })
  if (should304) {
    return new Response(null, {
      status: 304,
      headers: new Headers(),
    })
  }

  const provider = await getProviderClientById(stored.providerId)
  const parsedRange = parseRangeHeader(rangeHeader, stored.sizeInBytes)
  if (parsedRange === 'invalid') {
    return new Response(null, {
      status: 416,
      headers: new Headers({
        'Content-Range': `bytes */${stored.sizeInBytes}`,
      }),
    })
  }
  if (parsedRange === 'unsatisfiable') {
    return new Response(null, {
      status: 416,
      headers: new Headers({
        'Content-Range': `bytes */${stored.sizeInBytes}`,
      }),
    })
  }

  const command = new GetObjectCommand({
    Bucket: provider.bucketName,
    Key: stored.objectKey,
    ResponseContentType: stored.mimeType ?? undefined,
    Range: parsedRange
      ? `bytes=${parsedRange.start}-${parsedRange.end}`
      : undefined,
  })
  let upstream: {
    Body?: unknown
    ContentType?: string
    ContentLength?: number
    ETag?: string
    LastModified?: Date
    CacheControl?: string
    ContentDisposition?: string
    ContentEncoding?: string
    ContentLanguage?: string
    Metadata?: Record<string, unknown>
  }
  try {
    upstream = await sendWithProviderTimeout((abortSignal) =>
      provider.client.send(command, { abortSignal }),
    )
  } catch (error) {
    if (
      isStatusMetadataError(error) &&
      error.$metadata?.httpStatusCode === 404
    ) {
      await softDeleteMissingStoredObject({
        userId: bucket.userId,
        upstreamObjectKey: stored.objectKey,
      })
      return null
    }
    throw error
  }
  const fullLength = stored.sizeInBytes
  const rangeLength = parsedRange
    ? parsedRange.end - parsedRange.start + 1
    : fullLength
  const body = toBodyInit(upstream.Body)
  if (!body && rangeLength > 0) {
    return new Response(null, {
      status: 502,
      headers: new Headers({
        'x-amz-error-code': 'BadGateway',
        'x-amz-error-message': 'Provider returned an unreadable object stream',
      }),
    })
  }

  const headers = new Headers()
  if (upstream.Metadata) {
    for (const [key, value] of Object.entries(upstream.Metadata)) {
      if (typeof value === 'string') {
        headers.set(`x-amz-meta-${key}`, value)
      }
    }
  }
  if (upstream.ETag ?? stored.etag) {
    headers.set('ETag', normalizeETag(upstream.ETag ?? stored.etag ?? ''))
  }
  if (upstream.LastModified ?? effectiveLastModified) {
    headers.set(
      'Last-Modified',
      (upstream.LastModified ?? effectiveLastModified).toUTCString(),
    )
  }
  if (upstream.CacheControl ?? stored.cacheControl) {
    headers.set(
      'Cache-Control',
      upstream.CacheControl ?? stored.cacheControl ?? '',
    )
  }
  if (upstream.ContentDisposition) {
    headers.set('Content-Disposition', upstream.ContentDisposition)
  }
  if (upstream.ContentEncoding) {
    headers.set('Content-Encoding', upstream.ContentEncoding)
  }
  if (upstream.ContentLanguage) {
    headers.set('Content-Language', upstream.ContentLanguage)
  }
  headers.set(
    'Content-Type',
    upstream.ContentType ?? stored.mimeType ?? 'application/octet-stream',
  )
  headers.set('Accept-Ranges', 'bytes')
  headers.set(
    'Content-Length',
    String(parsedRange ? rangeLength : (upstream.ContentLength ?? fullLength)),
  )
  if (parsedRange) {
    headers.set(
      'Content-Range',
      `bytes ${parsedRange.start}-${parsedRange.end}/${fullLength}`,
    )
  }

  return new Response(body, {
    status: parsedRange ? 206 : 200,
    headers,
  })
}

export async function headObject(
  bucket: BucketContext,
  objectKey: string,
  conditionals: ObjectConditionalHeaders,
): Promise<Response | null> {
  const stored = await findStoredObject(bucket, objectKey)
  if (!stored) {
    return null
  }

  const effectiveLastModified = stored.lastModified ?? stored.updatedAt
  const should304 = shouldReturnNotModified({
    eTag: stored.etag,
    lastModified: effectiveLastModified,
    ifNoneMatch: conditionals.ifNoneMatch,
    ifModifiedSince: conditionals.ifModifiedSince,
  })
  if (should304) {
    return new Response(null, {
      status: 304,
      headers: new Headers(),
    })
  }

  const provider = await getProviderClientById(stored.providerId)
  let upstreamHead: {
    ETag?: string
    LastModified?: Date
    CacheControl?: string
    ContentType?: string
    ContentLength?: number
    Metadata?: Record<string, unknown>
  }
  try {
    upstreamHead = await sendWithProviderTimeout((abortSignal) =>
      provider.client.send(
        new HeadObjectCommand({
          Bucket: provider.bucketName,
          Key: stored.objectKey,
        }),
        { abortSignal },
      ),
    )
  } catch (error) {
    if (
      isStatusMetadataError(error) &&
      error.$metadata?.httpStatusCode === 404
    ) {
      await softDeleteMissingStoredObject({
        userId: bucket.userId,
        upstreamObjectKey: stored.objectKey,
      })
      return null
    }
    throw error
  }

  const headers = new Headers()
  if (upstreamHead.ETag ?? stored.etag) {
    headers.set('ETag', normalizeETag(upstreamHead.ETag ?? stored.etag ?? ''))
  }
  if (upstreamHead.LastModified ?? effectiveLastModified) {
    headers.set(
      'Last-Modified',
      (upstreamHead.LastModified ?? effectiveLastModified).toUTCString(),
    )
  }
  if (upstreamHead.CacheControl ?? stored.cacheControl) {
    headers.set(
      'Cache-Control',
      upstreamHead.CacheControl ?? stored.cacheControl ?? '',
    )
  }
  headers.set(
    'Content-Type',
    upstreamHead.ContentType ?? stored.mimeType ?? 'application/octet-stream',
  )
  headers.set(
    'Content-Length',
    String(upstreamHead.ContentLength ?? stored.sizeInBytes),
  )
  if (upstreamHead.Metadata) {
    for (const [key, value] of Object.entries(upstreamHead.Metadata)) {
      if (typeof value === 'string') {
        headers.set(`x-amz-meta-${key}`, value)
      }
    }
  }

  return new Response(null, {
    status: 200,
    headers,
  })
}

export async function deleteObject(
  bucket: BucketContext,
  objectKey: string,
): Promise<void> {
  const upstreamKey = upstreamKeyFor(bucket, objectKey)
  const stored = await findStoredObject(bucket, objectKey)
  if (!stored) {
    await softDeleteMissingStoredObject({
      userId: bucket.userId,
      upstreamObjectKey: upstreamKey,
    })
    return
  }

  const provider = await getProviderClientById(stored.providerId)

  try {
    await sendWithProviderTimeout((abortSignal) =>
      provider.client.send(
        new DeleteObjectCommand({
          Bucket: provider.bucketName,
          Key: upstreamKey,
        }),
        { abortSignal },
      ),
    )
  } catch (error) {
    if (error instanceof ProviderRequestTimeoutError) {
      throw error
    }
    const providerMessage =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : 'Unknown provider delete error'
    console.warn(
      '[S3 Gateway] deleteObject upstream delete non-fatal failure:',
      providerMessage,
    )
  }

  try {
    const existingRows = await db
      .select({ id: file.id, sizeInBytes: file.sizeInBytes })
      .from(file)
      .where(
        and(
          eq(file.userId, bucket.userId),
          eq(file.objectKey, upstreamKey),
          eq(file.isDeleted, false),
          eq(file.isTrashed, false),
        ),
      )

    const deletedBytes = existingRows.reduce(
      (total, row) => total + row.sizeInBytes,
      0,
    )

    await db
      .delete(file)
      .where(
        and(
          eq(file.userId, bucket.userId),
          eq(file.objectKey, upstreamKey),
          eq(file.isDeleted, false),
          eq(file.isTrashed, false),
        ),
      )

    await Promise.all(
      existingRows.map((row) =>
        deleteNodeByEntity(bucket.userId, 'file', row.id),
      ),
    )

    if (deletedBytes > 0) {
      const storageRows = await db
        .select({ usedStorage: userStorage.usedStorage })
        .from(userStorage)
        .where(eq(userStorage.userId, bucket.userId))
        .limit(1)

      if (storageRows.length > 0) {
        const nextUsedStorage = Math.max(
          0,
          storageRows[0].usedStorage - deletedBytes,
        )
        await db
          .update(userStorage)
          .set({ usedStorage: nextUsedStorage })
          .where(eq(userStorage.userId, bucket.userId))
      }
      await patchQuotaUsedStorage(bucket.userId, -deletedBytes)
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : 'Unknown query error'
    console.warn(
      '[S3 Gateway] deleteObject failed to hard delete file record:',
      message,
    )
  }
}

export async function copyObject(
  sourceBucket: BucketContext,
  sourceObjectKey: string,
  destinationBucket: BucketContext,
  destinationObjectKey: string,
): Promise<{ eTag: string | null; lastModified: Date }> {
  const sourceStored = await findStoredObject(sourceBucket, sourceObjectKey)
  const sourceUpstreamKey =
    sourceStored?.objectKey ?? upstreamKeyFor(sourceBucket, sourceObjectKey)
  const destinationUpstreamKey = upstreamKeyFor(
    destinationBucket,
    destinationObjectKey,
  )
  const sourceProvider = await getProviderClientById(
    sourceStored?.providerId ?? null,
  )

  let copiedEtag: string | undefined
  let copiedLastModified: Date | undefined
  try {
    const copied = await sendWithProviderTimeout((abortSignal) =>
      sourceProvider.client.send(
        new CopyObjectCommand({
          Bucket: sourceProvider.bucketName,
          Key: destinationUpstreamKey,
          CopySource: copySourcePath(
            sourceProvider.bucketName,
            sourceUpstreamKey,
          ),
        }),
        { abortSignal },
      ),
    )
    copiedEtag = copied.CopyObjectResult?.ETag
    copiedLastModified = copied.CopyObjectResult?.LastModified
  } catch (error) {
    if (error instanceof ProviderRequestTimeoutError) {
      throw error
    }

    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : 'Unknown provider copy error'
    console.warn(
      '[S3 Gateway] CopyObject command failed; falling back to streamed GET+PUT copy:',
      message,
    )

    const sourceGet = await sendWithProviderTimeout((abortSignal) =>
      sourceProvider.client.send(
        new GetObjectCommand({
          Bucket: sourceProvider.bucketName,
          Key: sourceUpstreamKey,
        }),
        { abortSignal },
      ),
    )

    await sendWithProviderTimeout((abortSignal) =>
      sourceProvider.client.send(
        new PutObjectCommand({
          Bucket: sourceProvider.bucketName,
          Key: destinationUpstreamKey,
          Body: toProviderPutBody(sourceGet.Body),
          ContentType:
            sourceGet.ContentType ??
            sourceStored?.mimeType ??
            'application/octet-stream',
          CacheControl:
            sourceGet.CacheControl ?? sourceStored?.cacheControl ?? undefined,
          ContentLength:
            typeof sourceGet.ContentLength === 'number'
              ? sourceGet.ContentLength
              : undefined,
        }),
        { abortSignal },
      ),
    )
  }

  const head = await sendWithProviderTimeout((abortSignal) =>
    sourceProvider.client.send(
      new HeadObjectCommand({
        Bucket: sourceProvider.bucketName,
        Key: destinationUpstreamKey,
      }),
      { abortSignal },
    ),
  )

  const persistedEtag = resolvePersistedETag(head.ETag, copiedEtag)
  const persistedLastModified =
    head.LastModified ?? copiedLastModified ?? new Date()

  await upsertCommittedFile({
    userId: destinationBucket.userId,
    providerId: sourceProvider.providerId,
    objectKey: destinationUpstreamKey,
    contentType: head.ContentType ?? sourceStored?.mimeType ?? null,
    mappedFolderId: destinationBucket.mappedFolderId,
    fileName: deriveFileName(destinationObjectKey),
    sizeInBytes:
      typeof head.ContentLength === 'number'
        ? head.ContentLength
        : (sourceStored?.sizeInBytes ?? 0),
    etag: persistedEtag,
    cacheControl: head.CacheControl ?? sourceStored?.cacheControl ?? null,
    lastModified: persistedLastModified,
  })

  return {
    eTag: persistedEtag,
    lastModified: persistedLastModified,
  }
}
