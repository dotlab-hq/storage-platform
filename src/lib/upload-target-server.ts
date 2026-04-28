import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth.server'
import {
  getProviderClientById,
  selectProviderForUpload,
} from '@/lib/s3-provider-client'
import { DEFAULT_FILE_SIZE_LIMIT_BYTES } from '@/lib/storage-quota-constants'
import { logActivity } from '@/lib/activity'

const PROXY_UPLOAD_URL = '/api/storage/upload/proxy'

export const MAX_PROXY_STREAM_UPLOAD_BYTES = 5 * 1024 * 1024 * 1024

const PrepareUploadTargetSchema = z.object({
  objectKey: z.string().min(1),
  contentType: z.string().min(1),
  fileSize: z.number().nonnegative(),
})

async function getUserFileSizeLimit(userId: string): Promise<number> {
  const [{ db }, { userStorage }, { eq }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
    import('drizzle-orm'),
  ])

  const storageRows = await db
    .select({ fileSizeLimit: userStorage.fileSizeLimit })
    .from(userStorage)
    .where(eq(userStorage.userId, userId))
    .limit(1)

  return storageRows[0]?.fileSizeLimit ?? DEFAULT_FILE_SIZE_LIMIT_BYTES
}

export async function assertFileSizeWithinLimit(
  userId: string,
  fileSize: number,
): Promise<void> {
  const fileSizeLimit = await getUserFileSizeLimit(userId)
  if (fileSize > fileSizeLimit) {
    throw new Error(
      `File exceeds your maximum allowed size (${fileSizeLimit} bytes)`,
    )
  }
}

export const prepareUploadTarget = createServerFn({ method: 'POST' })
  .inputValidator((data: z.infer<typeof PrepareUploadTargetSchema>) =>
    PrepareUploadTargetSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const authUser = await getAuthenticatedUser()
    await assertFileSizeWithinLimit(authUser.id, data.fileSize)

    const provider = await selectProviderForUpload(data.fileSize, authUser.id)
    let result: {
      uploadMethod: 'proxy' | 'direct'
      providerId: string
      uploadUrl?: string
      presignedUrl?: string
    }
    if (provider.proxyUploadsEnabled) {
      if (data.fileSize > MAX_PROXY_STREAM_UPLOAD_BYTES) {
        throw new Error(
          'Proxy uploads currently support files up to 5 GB because the upstream transfer uses a single streamed PutObject request',
        )
      }

      result = {
        uploadMethod: 'proxy',
        providerId: provider.providerId,
        uploadUrl: PROXY_UPLOAD_URL,
      }
    } else {
      const { PutObjectCommand } = await import('@aws-sdk/client-s3')
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
      const directProvider = await getProviderClientById(provider.providerId)
      const command = new PutObjectCommand({
        Bucket: directProvider.bucketName,
        Key: data.objectKey,
        ContentType: data.contentType,
      })

      const presignedUrl = await getSignedUrl(directProvider.client, command, {
        expiresIn: 3600,
      })

      result = {
        uploadMethod: 'direct',
        providerId: directProvider.providerId,
        presignedUrl,
      }
    }

    await logActivity({
      userId: authUser.id,
      eventType: 'upload_prepare',
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
