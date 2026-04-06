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
  buildCacheHeaders,
  normalizeETag,
  shouldReturnNotModified,
} from '@/lib/s3-gateway/s3-conditional-cache'
import {
  deleteCachedS3Object,
  getS3ObjectCacheKey,
} from '@/lib/s3-gateway/s3-get-object-cache'
import { findStoredObject } from '@/lib/s3-gateway/s3-stored-object'
import type { ObjectConditionalHeaders } from '@/lib/s3-gateway/s3-conditional-cache'
import {
  getProviderClientById,
  selectProviderForUpload,
} from '@/lib/s3-provider-client'
import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder, userStorage } from '@/db/schema/storage'
import {
  ProviderRequestTimeoutError,
  sendWithProviderTimeout,
} from './s3-provider-timeout'
import { upsertCommittedFile } from './upload-file-records'
import { buildUpstreamObjectKey, deriveFileName } from './upload-key-utils'
import { resolveVirtualFolder, splitObjectKey } from './virtual-fs'

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

export async function listObjectsV2(
  bucket: BucketContext,
  prefix: string,
): Promise<ListedS3Object[]> {
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
): Promise<string | null> {
  const cacheKey = getS3ObjectCacheKey(bucket.bucketId, objectKey)
  deleteCachedS3Object(cacheKey)
  const { folderPath, fileName, isDirectory } = splitObjectKey(objectKey)

  // Resolve the destination folder ID
  const targetFolderId = await resolveVirtualFolder(
    bucket.userId,
    bucket.mappedFolderId,
    folderPath,
  )

  if (isDirectory) {
    // Just create the directory structure, do not upload to S3
    return `"{empty-${Date.now()}}"`
  }

  const provider = await selectProviderForUpload(contentLength ?? 0)
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
        ContentLength: contentLength ?? undefined,
      }),
      { abortSignal },
    ),
  )

  let metadataETag: string | undefined
  let metadataCacheControl: string | undefined
  let metadataLastModified: Date | undefined
  let metadataContentLength: number | undefined
  try {
    const metadata = await sendWithProviderTimeout((abortSignal) =>
      provider.client.send(
        new HeadObjectCommand({
          Bucket: provider.bucketName,
          Key: upstreamKey,
        }),
        { abortSignal },
      ),
    )
    metadataETag = metadata.ETag
    metadataCacheControl = metadata.CacheControl
    metadataLastModified = metadata.LastModified
    metadataContentLength =
      typeof metadata.ContentLength === 'number'
        ? metadata.ContentLength
        : undefined
  } catch (error) {
    if (error instanceof ProviderRequestTimeoutError) {
      throw error
    }
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : 'Unknown provider metadata error'
    console.warn(
      '[S3 Gateway] Non-fatal HeadObject metadata fetch failure after PUT:',
      message,
    )
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
  if (body instanceof Uint8Array) {
    const cloned = new Uint8Array(body.byteLength)
    cloned.set(body)
    return cloned.buffer
  }
  if (
    typeof body === 'object' &&
    'transformToWebStream' in body &&
    typeof (body as { transformToWebStream?: unknown }).transformToWebStream ===
      'function'
  ) {
    const transformed = (
      body as { transformToWebStream: () => ReadableStream<Uint8Array> }
    ).transformToWebStream()
    return transformed
  }
  return null
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

export async function getObject(
  bucket: BucketContext,
  objectKey: string,
  conditionals: ObjectConditionalHeaders,
): Promise<Response | null> {
  const stored = await findStoredObject(bucket, objectKey)
  if (!stored) {
    return null
  }

  const provider = await getProviderClientById(stored.providerId)
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
      headers: buildCacheHeaders({
        eTag: stored.etag,
        lastModified: effectiveLastModified,
        cacheControl: stored.cacheControl,
        includeDefaultCacheControl: false,
      }),
    })
  }

  const command = new GetObjectCommand({
    Bucket: provider.bucketName,
    Key: stored.objectKey,
    ResponseContentType: stored.mimeType ?? undefined,
  })
  const upstream = await sendWithProviderTimeout((abortSignal) =>
    provider.client.send(command, { abortSignal }),
  )
  const headers = buildCacheHeaders({
    eTag: stored.etag,
    lastModified: effectiveLastModified,
    cacheControl: stored.cacheControl,
  })
  headers.set(
    'Content-Type',
    upstream.ContentType ?? stored.mimeType ?? 'application/octet-stream',
  )
  headers.set(
    'Content-Length',
    String(upstream.ContentLength ?? stored.sizeInBytes),
  )

  return new Response(toBodyInit(upstream.Body), {
    status: 200,
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
      headers: buildCacheHeaders({
        eTag: stored.etag,
        lastModified: effectiveLastModified,
        cacheControl: stored.cacheControl,
        includeDefaultCacheControl: false,
      }),
    })
  }
  const headers = buildCacheHeaders({
    eTag: stored.etag,
    lastModified: effectiveLastModified,
    cacheControl: stored.cacheControl,
  })
  headers.set('Content-Type', stored.mimeType ?? 'application/octet-stream')
  headers.set('Content-Length', String(stored.sizeInBytes))

  return new Response(null, {
    status: 200,
    headers,
  })
}

export async function deleteObject(
  bucket: BucketContext,
  objectKey: string,
): Promise<void> {
  const cacheKey = getS3ObjectCacheKey(bucket.bucketId, objectKey)
  const upstreamKey = upstreamKeyFor(bucket, objectKey)
  const stored = await findStoredObject(bucket, objectKey)
  const provider = await getProviderClientById(stored?.providerId ?? null)

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
      .select({ sizeInBytes: file.sizeInBytes })
      .from(file)
      .where(
        and(
          eq(file.userId, bucket.userId),
          eq(file.objectKey, upstreamKey),
          eq(file.isDeleted, false),
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

  deleteCachedS3Object(cacheKey)
}

export async function copyObject(
  sourceBucket: BucketContext,
  sourceObjectKey: string,
  destinationBucket: BucketContext,
  destinationObjectKey: string,
): Promise<{ eTag: string | null; lastModified: Date }> {
  const destinationCacheKey = getS3ObjectCacheKey(
    destinationBucket.bucketId,
    destinationObjectKey,
  )
  deleteCachedS3Object(destinationCacheKey)
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
