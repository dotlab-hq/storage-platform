import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  ListPartsCommand,
  UploadPartCommand,
} from '@aws-sdk/client-s3'
import {
  assertFileSizeWithinLimit,
  MAX_PROXY_STREAM_UPLOAD_BYTES,
} from '@/lib/upload-target-server'
import { requireProxyProvider } from '@/lib/upload-proxy-provider'
import {
  ProxyCompleteSchema,
  ProxyInitiateSchema,
  parseProviderId,
  ProxyPartHeadersSchema,
  toNodeReadable,
} from '@/lib/upload-proxy-utils'

export async function handleInitiateUpload(request: Request, userId: string) {
  const payload = ProxyInitiateSchema.parse(await request.json())
  await assertFileSizeWithinLimit(userId, payload.fileSize)
  if (payload.fileSize > MAX_PROXY_STREAM_UPLOAD_BYTES) {
    throw new Error('Proxy multipart uploads support files up to 5 GB')
  }

  const provider = await requireProxyProvider(payload.providerId)
  const result = await provider.client.send(
    new CreateMultipartUploadCommand({
      Bucket: provider.bucketName,
      Key: payload.objectKey,
      ContentType: payload.contentType,
    }),
    { abortSignal: request.signal },
  )

  if (!result.UploadId) {
    throw new Error('Failed to initialize proxy multipart upload')
  }

  return Response.json({
    ok: true,
    uploadId: result.UploadId,
    partCount: payload.partCount,
  })
}

export async function handleUploadPart(request: Request) {
  if (!request.body) {
    throw new Error('Upload part body is required')
  }

  const payload = ProxyPartHeadersSchema.parse({
    objectKey: request.headers.get('x-upload-object-key'),
    providerId: parseProviderId(request.headers.get('x-upload-provider-id')),
    uploadId: request.headers.get('x-upload-id'),
    partNumber: Number(request.headers.get('x-upload-part-number')),
    partSize: request.headers.get('x-upload-part-size')
      ? Number(request.headers.get('x-upload-part-size'))
      : undefined,
  })

  const provider = await requireProxyProvider(payload.providerId)
  const result = await provider.client.send(
    new UploadPartCommand({
      Bucket: provider.bucketName,
      Key: payload.objectKey,
      UploadId: payload.uploadId,
      PartNumber: payload.partNumber,
      Body: toNodeReadable(request.body as ReadableStream<Uint8Array>),
      ContentLength: payload.partSize,
    }),
    { abortSignal: request.signal },
  )

  return Response.json({ ok: true, etag: result.ETag ?? null })
}

export async function handleCompleteUpload(request: Request) {
  const payload = ProxyCompleteSchema.parse(await request.json())
  const provider = await requireProxyProvider(payload.providerId)

  const listedParts = await provider.client.send(
    new ListPartsCommand({
      Bucket: provider.bucketName,
      Key: payload.objectKey,
      UploadId: payload.uploadId,
    }),
    { abortSignal: request.signal },
  )

  const parts = (listedParts.Parts ?? [])
    .filter((part): part is { ETag: string; PartNumber: number } => {
      return Boolean(part.ETag && part.PartNumber)
    })
    .sort((a, b) => a.PartNumber - b.PartNumber)

  if (parts.length === 0) {
    throw new Error('No uploaded parts were found for this proxy upload')
  }

  await provider.client.send(
    new CompleteMultipartUploadCommand({
      Bucket: provider.bucketName,
      Key: payload.objectKey,
      UploadId: payload.uploadId,
      MultipartUpload: {
        Parts: parts.map((part) => ({
          ETag: part.ETag,
          PartNumber: part.PartNumber,
        })),
      },
    }),
    { abortSignal: request.signal },
  )

  return Response.json({ ok: true, partCount: parts.length })
}
