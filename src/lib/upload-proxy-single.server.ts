import { PutObjectCommand } from '@aws-sdk/client-s3'
import { MAX_PROXY_STREAM_UPLOAD_BYTES } from '@/lib/upload-target-server'
import { requireProxyProvider } from '@/lib/upload-proxy-provider'
import {
  ProxySingleHeadersSchema,
  parseProviderId,
  toNodeReadable,
} from '@/lib/upload-proxy-utils'
import { db } from '@/db'
import { userStorage } from '@/db/schema/storage'
import { eq } from 'drizzle-orm'
import { DEFAULT_FILE_SIZE_LIMIT_BYTES } from '@/lib/storage-quota-constants'

async function assertFileSizeWithinLimit(userId: string, fileSize: number) {
  const storageRows = await db
    .select({ fileSizeLimit: userStorage.fileSizeLimit })
    .from(userStorage)
    .where(eq(userStorage.userId, userId))
    .limit(1)
  const fileSizeLimit =
    storageRows[0]?.fileSizeLimit ?? DEFAULT_FILE_SIZE_LIMIT_BYTES
  if (fileSize > fileSizeLimit) {
    throw new Error(
      `File exceeds your maximum allowed size (${fileSizeLimit} bytes)`,
    )
  }
}

export async function handleSingleUpload(request: Request, userId: string) {
  if (!request.body) {
    throw new Error('Upload body is required')
  }

  const payload = ProxySingleHeadersSchema.parse({
    objectKey: request.headers.get('x-upload-object-key'),
    providerId: parseProviderId(request.headers.get('x-upload-provider-id')),
    fileSize: Number(request.headers.get('x-upload-file-size')),
    contentType: request.headers.get('content-type'),
  })

  await assertFileSizeWithinLimit(userId, payload.fileSize)
  if (payload.fileSize > MAX_PROXY_STREAM_UPLOAD_BYTES) {
    throw new Error('Proxy uploads support files up to 5 GB')
  }

  const provider = await requireProxyProvider(payload.providerId)
  const result = await provider.client.send(
    new PutObjectCommand({
      Bucket: provider.bucketName,
      Key: payload.objectKey,
      Body: toNodeReadable(request.body as ReadableStream<Uint8Array>),
      ContentType: payload.contentType,
      ContentLength: payload.fileSize,
    }),
    { abortSignal: request.signal },
  )

  return Response.json({ ok: true, etag: result.ETag ?? null })
}
