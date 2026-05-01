// @ts-nocheck
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { Readable } from 'node:stream'
import { db } from '@/db'
import { multipartUploadPart, uploadAttempt } from '@/db/schema/s3-gateway'
import type { BucketContext } from '@/lib/s3-gateway/s3-context'
import {
  getProviderClientById,
  selectProviderForUpload,
} from '@/lib/s3-provider-client'
import { and, eq } from 'drizzle-orm'
import type { CompletedMultipartPart } from './s3-multipart-complete-parser'
import { upsertCommittedFile } from './upload-file-records'
import { buildUpstreamObjectKey, deriveFileName } from './upload-key-utils'
import { sendWithProviderTimeout } from './s3-provider-timeout'
import { normalizeETag } from './s3-conditional-cache'

const MULTIPART_UPLOAD_EXPIRY_MS = 60 * 60 * 1000

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

function normalizeMultipartPartETagForProvider(eTag: string): string {
  const trimmed = eTag.trim()
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

async function* streamWebChunks(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<Uint8Array> {
  const reader = stream.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        return
      }
      if (value) {
        yield value
      }
    }
  } finally {
    reader.releaseLock()
  }
}

function toNodeReadable(stream: ReadableStream<Uint8Array>): Readable {
  return Readable.from(streamWebChunks(stream))
}

function multipartPartObjectKey(
  upstreamObjectKey: string,
  uploadId: string,
  partNumber: number,
): string {
  return `${upstreamObjectKey}.__parts/${uploadId}/${String(partNumber).padStart(6, '0')}`
}

type ByteArrayBody = {
  transformToByteArray: () => Promise<Uint8Array>
}

function isByteArrayBody(value: unknown): value is ByteArrayBody {
  if (!value || typeof value !== 'object') {
    return false
  }
  const transformed = value as { transformToByteArray?: unknown }
  return typeof transformed.transformToByteArray === 'function'
}

function concatByteArrays(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
  const merged = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return merged
}

export async function createMultipartUpload(
  bucket: BucketContext,
  objectKey: string,
  contentType: string | null,
): Promise<string> {
  const attemptId = crypto.randomUUID()
  const provider = await selectProviderForUpload(1, bucket.userId)
  const upstreamObjectKey = buildUpstreamObjectKey(
    bucket.userId,
    bucket.bucketId,
    bucket.mappedFolderId,
    objectKey,
  )

  await db.insert(uploadAttempt).values({
    id: attemptId,
    userId: bucket.userId,
    bucketId: bucket.bucketId,
    providerId: provider.providerId,
    objectKey,
    upstreamObjectKey,
    uploadId: attemptId,
    initiatedByUserId: bucket.userId,
    expectedSize: 0,
    contentType,
    etag: null,
    storageClass: 'STANDARD',
    status: 'pending',
    expiresAt: new Date(Date.now() + MULTIPART_UPLOAD_EXPIRY_MS),
  })

  return attemptId
}

export async function uploadPart(
  bucket: BucketContext,
  objectKey: string,
  uploadId: string,
  partNumber: number,
  body: ReadableStream<Uint8Array>,
  contentType: string | null,
  contentLength: number | null,
): Promise<string | null> {
  const rows = await db
    .select({
      id: uploadAttempt.id,
      providerId: uploadAttempt.providerId,
      upstreamObjectKey: uploadAttempt.upstreamObjectKey,
      upstreamUploadId: uploadAttempt.etag,
    })
    .from(uploadAttempt)
    .where(
      and(
        eq(uploadAttempt.id, uploadId),
        eq(uploadAttempt.userId, bucket.userId),
        eq(uploadAttempt.bucketId, bucket.bucketId),
      ),
    )
    .limit(1)

  if (rows.length === 0) {
    throw new Error('Invalid or expired upload ID')
  }

  const attempt = rows[0]
  const provider = await getProviderClientById(attempt.providerId)
  const temporaryPartKey = multipartPartObjectKey(
    attempt.upstreamObjectKey,
    uploadId,
    partNumber,
  )

  const result = await sendWithProviderTimeout((abortSignal) =>
    provider.client.send(
      new PutObjectCommand({
        Bucket: provider.bucketName,
        Key: temporaryPartKey,
        Body: toNodeReadable(body),
        ContentType: contentType ?? 'application/octet-stream',
        ContentLength: contentLength ?? undefined,
      }),
      { abortSignal },
    ),
  )

  await db
    .insert(multipartUploadPart)
    .values({
      uploadAttemptId: attempt.id,
      partNumber,
      etag: result.ETag ?? null,
      sizeInBytes: contentLength ?? 0,
      upstreamPartLocator: temporaryPartKey,
    })
    .onConflictDoUpdate({
      target: [
        multipartUploadPart.uploadAttemptId,
        multipartUploadPart.partNumber,
      ],
      set: {
        etag: result.ETag ?? null,
        sizeInBytes: contentLength ?? 0,
        upstreamPartLocator: temporaryPartKey,
      },
    })

  await db
    .update(uploadAttempt)
    .set({
      objectKey,
      contentType,
    })
    .where(eq(uploadAttempt.id, uploadId))

  return result.ETag ?? null
}

export async function completeMultipartUpload(
  bucket: BucketContext,
  uploadId: string,
  parts: CompletedMultipartPart[],
): Promise<string> {
  const rows = await db
    .select({
      id: uploadAttempt.id,
      providerId: uploadAttempt.providerId,
      objectKey: uploadAttempt.objectKey,
      upstreamObjectKey: uploadAttempt.upstreamObjectKey,
      contentType: uploadAttempt.contentType,
      status: uploadAttempt.status,
      upstreamUploadId: uploadAttempt.etag,
    })
    .from(uploadAttempt)
    .where(
      and(
        eq(uploadAttempt.id, uploadId),
        eq(uploadAttempt.userId, bucket.userId),
        eq(uploadAttempt.bucketId, bucket.bucketId),
      ),
    )
    .limit(1)

  if (rows.length === 0) {
    throw new Error('Invalid or expired upload ID')
  }

  const attempt = rows[0]
  const provider = await getProviderClientById(attempt.providerId)

  if (parts.length === 0) {
    throw new Error(
      'MalformedXML: CompleteMultipartUpload request must include at least one Part',
    )
  }

  const persistedParts = await db
    .select({
      partNumber: multipartUploadPart.partNumber,
      etag: multipartUploadPart.etag,
      size: multipartUploadPart.sizeInBytes,
      locator: multipartUploadPart.upstreamPartLocator,
    })
    .from(multipartUploadPart)
    .where(eq(multipartUploadPart.uploadAttemptId, attempt.id))

  const persistedByPart = new Map(
    persistedParts.map((part) => [part.partNumber, part]),
  )
  const orderedParts = [...parts].sort((left, right) => {
    return left.partNumber - right.partNumber
  })

  const assembledChunks: Uint8Array[] = []
  for (const requestedPart of orderedParts) {
    const storedPart = persistedByPart.get(requestedPart.partNumber)
    if (!storedPart || !storedPart.locator) {
      throw new Error('InvalidPart: Referenced multipart part was not uploaded')
    }

    const normalizedRequested = normalizeMultipartPartETagForProvider(
      requestedPart.eTag,
    )
    const normalizedStored = normalizeETag(storedPart.etag)
    if (normalizedStored && normalizedRequested !== normalizedStored) {
      throw new Error('InvalidPart: Referenced multipart part ETag mismatch')
    }

    const loadedPart = await sendWithProviderTimeout((abortSignal) =>
      provider.client.send(
        new GetObjectCommand({
          Bucket: provider.bucketName,
          Key: storedPart.locator,
        }),
        { abortSignal },
      ),
    )
    if (!isByteArrayBody(loadedPart.Body)) {
      throw new Error('InvalidPart: Uploaded multipart part body is unreadable')
    }
    assembledChunks.push(await loadedPart.Body.transformToByteArray())
  }

  const assembledBody = concatByteArrays(assembledChunks)
  const putResult = await sendWithProviderTimeout((abortSignal) =>
    provider.client.send(
      new PutObjectCommand({
        Bucket: provider.bucketName,
        Key: attempt.upstreamObjectKey,
        Body: assembledBody,
        ContentType: attempt.contentType ?? 'application/octet-stream',
        ContentLength: assembledBody.byteLength,
      }),
      { abortSignal },
    ),
  )

  await Promise.all(
    persistedParts
      .filter((part) => Boolean(part.locator))
      .map((part) =>
        sendWithProviderTimeout((abortSignal) =>
          provider.client.send(
            new DeleteObjectCommand({
              Bucket: provider.bucketName,
              Key: part.locator ?? '',
            }),
            { abortSignal },
          ),
        ).catch(() => undefined),
      ),
  )

  let head: {
    ContentLength?: number
    ETag?: string
    CacheControl?: string
    LastModified?: Date
  } | null = null
  let metadataTimer: ReturnType<typeof setTimeout> | null = null
  try {
    const metadataAbortController = new AbortController()
    metadataTimer = setTimeout(
      () => metadataAbortController.abort(),
      PROVIDER_METADATA_HEAD_TIMEOUT_MS,
    )
    head = await provider.client.send(
      new HeadObjectCommand({
        Bucket: provider.bucketName,
        Key: attempt.upstreamObjectKey,
      }),
      { abortSignal: metadataAbortController.signal },
    )
  } catch (error) {
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : 'Unknown provider metadata error'
    console.warn(
      '[S3 Gateway] Non-fatal HeadObject metadata fetch failure after multipart complete:',
      message,
    )
  } finally {
    if (metadataTimer) {
      clearTimeout(metadataTimer)
    }
  }

  const observedSize =
    typeof head?.ContentLength === 'number'
      ? head.ContentLength
      : assembledBody.byteLength
  const normalizedCompleteETag = putResult.ETag
    ? normalizeETag(putResult.ETag)
    : null
  const normalizedHeadETag = head?.ETag ? normalizeETag(head.ETag) : null
  const eTag = normalizedCompleteETag ?? normalizedHeadETag ?? ''

  await upsertCommittedFile({
    userId: bucket.userId,
    providerId: attempt.providerId,
    objectKey: attempt.upstreamObjectKey,
    contentType: attempt.contentType,
    mappedFolderId: bucket.mappedFolderId,
    fileName: deriveFileName(attempt.objectKey),
    sizeInBytes: observedSize,
    etag: eTag || null,
    cacheControl: head?.CacheControl ?? null,
    lastModified: head?.LastModified ?? new Date(),
  })

  await db
    .update(uploadAttempt)
    .set({
      status: 'uploaded',
      etag: eTag,
      completedAt: new Date(),
      errorMessage: null,
    })
    .where(eq(uploadAttempt.id, uploadId))

  return eTag
}

export async function abortMultipartUpload(
  bucket: BucketContext,
  uploadId: string,
): Promise<void> {
  const rows = await db
    .select({
      providerId: uploadAttempt.providerId,
      upstreamObjectKey: uploadAttempt.upstreamObjectKey,
      upstreamUploadId: uploadAttempt.etag,
    })
    .from(uploadAttempt)
    .where(
      and(
        eq(uploadAttempt.id, uploadId),
        eq(uploadAttempt.userId, bucket.userId),
        eq(uploadAttempt.bucketId, bucket.bucketId),
      ),
    )
    .limit(1)

  if (rows.length > 0) {
    const attempt = rows[0]
    const provider = await getProviderClientById(attempt.providerId)
    const storedParts = await db
      .select({ locator: multipartUploadPart.upstreamPartLocator })
      .from(multipartUploadPart)
      .where(eq(multipartUploadPart.uploadAttemptId, uploadId))
    await Promise.all(
      storedParts
        .filter((part) => Boolean(part.locator))
        .map((part) =>
          sendWithProviderTimeout((abortSignal) =>
            provider.client.send(
              new DeleteObjectCommand({
                Bucket: provider.bucketName,
                Key: part.locator ?? '',
              }),
              { abortSignal },
            ),
          ).catch(() => undefined),
        ),
    )
  }

  await db
    .delete(multipartUploadPart)
    .where(and(eq(multipartUploadPart.uploadAttemptId, uploadId)))

  await db
    .update(uploadAttempt)
    .set({
      status: 'failed',
      errorMessage: 'aborted',
    })
    .where(
      and(
        eq(uploadAttempt.id, uploadId),
        eq(uploadAttempt.userId, bucket.userId),
        eq(uploadAttempt.bucketId, bucket.bucketId),
      ),
    )
}
