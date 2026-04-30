import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth.server'
import {
  getProviderClientById,
  selectProviderForUpload,
} from '@/lib/s3-provider-client'
import { DEFAULT_FILE_SIZE_LIMIT_BYTES } from '@/lib/storage-quota-constants'
import { logActivity } from '@/lib/activity'
import { db } from '@/db'
import { userStorage } from '@/db/schema/storage'
import { eq } from 'drizzle-orm'

const PROXY_UPLOAD_URL = '/api/storage/upload/proxy'

export const MAX_PROXY_STREAM_UPLOAD_BYTES = 5 * 1024 * 1024 * 1024

const PrepareUploadTargetSchema = z.object({
  objectKey: z.string().min(1),
  contentType: z.string().min(1),
  fileSize: z.number().nonnegative(),
})

export const prepareUploadTarget = createServerFn({ method: 'POST' })
  .inputValidator((data: z.infer<typeof PrepareUploadTargetSchema>) =>
    PrepareUploadTargetSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const authUser = await getAuthenticatedUser()

    const storageRows = await db
      .select({ fileSizeLimit: userStorage.fileSizeLimit })
      .from(userStorage)
      .where(eq(userStorage.userId, authUser.id))
      .limit(1)
    const fileSizeLimit =
      storageRows[0]?.fileSizeLimit ?? DEFAULT_FILE_SIZE_LIMIT_BYTES
    if (data.fileSize > fileSizeLimit) {
      throw new Error(
        `File exceeds your maximum allowed size (${fileSizeLimit} bytes)`,
      )
    }

    const provider = await selectProviderForUpload(data.fileSize, authUser.id)

    if (provider.proxyUploadsEnabled) {
      if (data.fileSize > MAX_PROXY_STREAM_UPLOAD_BYTES) {
        throw new Error(
          'Proxy uploads currently support files up to 5 GB because the upstream transfer uses a single streamed PutObject request',
        )
      }

      const result = {
        uploadMethod: 'proxy' as const,
        providerId: provider.providerId!,
        uploadUrl: PROXY_UPLOAD_URL,
      }

      await logActivity({
        userId: authUser.id,
        eventType: 'file_upload',
        tags: ['API', 'Upload'],
        meta: {
          objectKey: data.objectKey,
          fileSize: data.fileSize,
          contentType: data.contentType,
          providerId: result.providerId,
          uploadMethod: result.uploadMethod,
        },
      })

      return result
    }

    const { PutObjectCommand } = await import('@aws-sdk/client-s3')
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')

    let presignedUrl: string
    try {
      const directProvider = await getProviderClientById(provider.providerId)
      const command = new PutObjectCommand({
        Bucket: directProvider.bucketName,
        Key: data.objectKey,
        ContentType: data.contentType,
      })

      presignedUrl = await getSignedUrl(directProvider.client, command, {
        expiresIn: 3600,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[prepareUploadTarget] Failed to generate presigned URL:', {
        providerId: provider.providerId,
        bucketName: provider.bucketName,
        objectKey: data.objectKey,
        error: message,
        errorName: error instanceof Error ? error.name : undefined,
      })
      throw new Error(
        `Failed to generate upload URL: ${message}. ` +
          `Check that the storage provider (${provider.providerName}) is properly configured, ` +
          `has valid credentials, and the region matches the bucket's location.`,
      )
    }

    const result = {
      uploadMethod: 'direct' as const,
      providerId: provider.providerId!,
      presignedUrl,
    }

    await logActivity({
      userId: authUser.id,
      eventType: 'file_upload',
      tags: ['API', 'Upload'],
      meta: {
        objectKey: data.objectKey,
        fileSize: data.fileSize,
        contentType: data.contentType,
        providerId: result.providerId,
        uploadMethod: result.uploadMethod,
      },
    })

    return result
  })
