import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  HeadObjectCommand,
  UploadPartCommand,
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
  const create = await sendWithProviderTimeout((abortSignal) =>
    provider.client.send(
      new CreateMultipartUploadCommand({
        Bucket: provider.bucketName,
        Key: upstreamObjectKey,
        ContentType: contentType ?? 'application/octet-stream',
      }),
      { abortSignal },
    ),
  )

  if (!create.UploadId) {
    throw new Error('Upstream provider did not return UploadId')
  }

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
    etag: create.UploadId,
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
  const upstreamUploadId = attempt.upstreamUploadId
  if (!upstreamUploadId) {
    throw new Error('Invalid or expired upload ID')
  }

  const result = await sendWithProviderTimeout((abortSignal) =>
    provider.client.send(
      new UploadPartCommand({
        Bucket: provider.bucketName,
        Key: attempt.upstreamObjectKey,
        UploadId: upstreamUploadId,
        PartNumber: partNumber,
        Body: toNodeReadable(body),
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
      upstreamPartLocator: `${attempt.upstreamObjectKey}#part-${partNumber}`,
    })
    .onConflictDoUpdate({
      target: [
        multipartUploadPart.uploadAttemptId,
        multipartUploadPart.partNumber,
      ],
      set: {
        etag: result.ETag ?? null,
        sizeInBytes: contentLength ?? 0,
        upstreamPartLocator: `${attempt.upstreamObjectKey}#part-${partNumber}`,
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
  const upstreamUploadId = attempt.upstreamUploadId
  if (!upstreamUploadId) {
    throw new Error('Invalid or expired upload ID')
  }

  if (parts.length === 0) {
    throw new Error(
      'MalformedXML: CompleteMultipartUpload request must include at least one Part',
    )
  }

  const complete = await sendWithProviderTimeout((abortSignal) =>
    provider.client.send(
      new CompleteMultipartUploadCommand({
        Bucket: provider.bucketName,
        Key: attempt.upstreamObjectKey,
        UploadId: upstreamUploadId,
        MultipartUpload: {
          Parts: parts.map((item) => ({
            ETag: item.eTag,
            PartNumber: item.partNumber,
          })),
        },
      }),
      { abortSignal },
    ),
  )

  const head = await sendWithProviderTimeout((abortSignal) =>
    provider.client.send(
      new HeadObjectCommand({
        Bucket: provider.bucketName,
        Key: attempt.upstreamObjectKey,
      }),
      { abortSignal },
    ),
  )

  const observedSize = Number(head.ContentLength ?? 0)
  const normalizedCompleteETag = complete.ETag
    ? normalizeETag(complete.ETag)
    : null
  const normalizedHeadETag = head.ETag ? normalizeETag(head.ETag) : null
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
    cacheControl: head.CacheControl ?? null,
    lastModified: head.LastModified ?? new Date(),
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
    const upstreamUploadId = attempt.upstreamUploadId
    if (upstreamUploadId) {
      const provider = await getProviderClientById(attempt.providerId)
      await sendWithProviderTimeout((abortSignal) =>
        provider.client.send(
          new AbortMultipartUploadCommand({
            Bucket: provider.bucketName,
            Key: attempt.upstreamObjectKey,
            UploadId: upstreamUploadId,
          }),
          { abortSignal },
        ),
      )
    }
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
