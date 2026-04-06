import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { selectProviderForUpload } from '@/lib/s3-provider-client'

const CHUNK_SIZE_BYTES = 8 * 1024 * 1024
const MAX_CONCURRENT_PARTS = 4
const MAX_UPLOAD_ATTEMPTS = 10

function splitIntoChunks(content: Uint8Array): Uint8Array[] {
  const chunks: Uint8Array[] = []
  let offset = 0
  while (offset < content.byteLength) {
    const next = Math.min(offset + CHUNK_SIZE_BYTES, content.byteLength)
    chunks.push(content.slice(offset, next))
    offset = next
  }
  return chunks
}

async function uploadPart(
  presignedUrl: string,
  chunk: Uint8Array,
): Promise<string> {
  const body = chunk as unknown as BodyInit
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body,
  })
  if (!response.ok) {
    throw new Error(`Failed to upload multipart part: HTTP ${response.status}`)
  }

  const eTag = response.headers.get('etag')
  if (!eTag) {
    throw new Error('Multipart part response was missing ETag header')
  }

  return eTag
}

async function uploadPartWithRetry(
  createPresignedUrl: () => Promise<string>,
  chunk: Uint8Array,
): Promise<string> {
  let lastError: Error | null = null
  for (let attempt = 1; attempt <= MAX_UPLOAD_ATTEMPTS; attempt += 1) {
    try {
      const presignedUrl = await createPresignedUrl()
      return await uploadPart(presignedUrl, chunk)
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error('Unknown multipart error')
      if (attempt === MAX_UPLOAD_ATTEMPTS) {
        break
      }
      const delayMs = Math.min(10_000, 500 * attempt)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  throw new Error(
    `Failed to upload multipart part after ${MAX_UPLOAD_ATTEMPTS} attempts: ${lastError?.message ?? 'Unknown error'}`,
  )
}

export async function uploadToProviderWithMultipart(input: {
  objectKey: string
  contentType: string
  content: Uint8Array
}): Promise<{ providerId: string | null }> {
  const provider = await selectProviderForUpload(input.content.byteLength)
  const createResult = await provider.client.send(
    new CreateMultipartUploadCommand({
      Bucket: provider.bucketName,
      Key: input.objectKey,
      ContentType: input.contentType,
    }),
  )

  const uploadId = createResult.UploadId
  if (!uploadId) {
    throw new Error('Failed to create multipart upload session')
  }

  const chunks = splitIntoChunks(input.content)
  const completedParts: { PartNumber: number; ETag: string }[] = []
  let nextIndex = 0

  const worker = async () => {
    while (true) {
      const index = nextIndex
      nextIndex += 1
      if (index >= chunks.length) {
        return
      }

      const partNumber = index + 1
      const eTag = await uploadPartWithRetry(
        async () =>
          getSignedUrl(
            provider.client,
            new UploadPartCommand({
              Bucket: provider.bucketName,
              Key: input.objectKey,
              UploadId: uploadId,
              PartNumber: partNumber,
            }),
            {
              expiresIn: 3600,
            },
          ),
        chunks[index],
      )
      completedParts.push({ PartNumber: partNumber, ETag: eTag })
    }
  }

  const workerCount = Math.min(MAX_CONCURRENT_PARTS, chunks.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))

  await provider.client.send(
    new CompleteMultipartUploadCommand({
      Bucket: provider.bucketName,
      Key: input.objectKey,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: [...completedParts].sort((a, b) => a.PartNumber - b.PartNumber),
      },
    }),
  )

  return { providerId: provider.providerId }
}
