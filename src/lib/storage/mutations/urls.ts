import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'

import { getAuthenticatedUser } from '@/lib/server-auth.server'
import { db } from '@/db'
import { file as storageFile } from '@/db/schema/storage'
import { storageProvider } from '@/db/schema/storage-provider'
import { getProviderClientById } from '@/lib/s3-provider-client'
import { withActivityLogging } from '@/lib/activity-logging'

const GetPresignedUrlSchema = z.object({
  fileId: z.string().min(1),
})

export const getFilePresignedUrlFn = createServerFn({ method: 'GET' })
  .inputValidator(GetPresignedUrlSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    return withActivityLogging(
      user.id,
      'file_download',
      {
        resourceType: 'file',
        resourceId: data.fileId,
        tags: ['Files', 'API'],
      },
      async () => {
        const { fileId } = data
        const userId = user.id

        const fileRows = await db
          .select({
            id: storageFile.id,
            name: storageFile.name,
            mimeType: storageFile.mimeType,
            objectKey: storageFile.objectKey,
            providerId: storageFile.providerId,
            bucketName: storageProvider.bucketName,
          })
          .from(storageFile)
          .leftJoin(
            storageProvider,
            eq(storageFile.providerId, storageProvider.id),
          )
          .where(
            and(eq(storageFile.id, fileId), eq(storageFile.userId, userId)),
          )
          .limit(1)

        if (fileRows.length === 0) {
          throw new Error('File not found')
        }

        const fileData = fileRows[0]

        if (!fileData.providerId) {
          throw new Error('File has no associated storage provider')
        }
        if (!fileData.bucketName) {
          throw new Error('Storage provider missing bucket name')
        }

        let presignedUrl: string
        try {
          const { client } = await getProviderClientById(fileData.providerId)
          const objectKey = fileData.objectKey
          presignedUrl = await getSignedUrl(
            client,
            new GetObjectCommand({
              Bucket: fileData.bucketName,
              Key: objectKey,

              ResponseContentDisposition: `inline; filename="${fileData.name}"`,
            }),
            { expiresIn: 3600 },
          )
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Unknown error'
          console.error(
            '[getFilePresignedUrlFn] Failed to generate presigned URL:',
            {
              fileId,
              providerId: fileData.providerId,
              bucketName: fileData.bucketName,
              error: message,
              errorName: error instanceof Error ? error.name : undefined,
            },
          )
          throw new Error(
            `Failed to generate download URL: ${message}. ` +
              `This may indicate a configuration issue with the storage provider or region mismatch.`,
          )
        }

        return { url: presignedUrl }
      },
    )
  })

export const getOwnedFileRedirectUrlFn = createServerFn({ method: 'GET' })
  .inputValidator(GetPresignedUrlSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    return withActivityLogging(
      user.id,
      'file_view',
      {
        resourceType: 'file',
        resourceId: data.fileId,
        tags: ['Files', 'API'],
      },
      async () => {
        const { fileId } = data
        const userId = user.id

        const fileRows = await db
          .select({
            id: storageFile.id,
            name: storageFile.name,
            mimeType: storageFile.mimeType,
            objectKey: storageFile.objectKey,
            providerId: storageFile.providerId,
            bucketName: storageProvider.bucketName,
          })
          .from(storageFile)
          .leftJoin(
            storageProvider,
            eq(storageFile.providerId, storageProvider.id),
          )
          .where(
            and(
              eq(storageFile.id, fileId),
              eq(storageFile.userId, userId),
              eq(storageFile.isDeleted, false),
            ),
          )
          .limit(1)

        if (fileRows.length === 0) {
          throw new Error('File not found or access denied')
        }

        const fileData = fileRows[0]

        if (!fileData.providerId || !fileData.bucketName) {
          throw new Error('File configuration invalid')
        }

        let viewUrl: string
        try {
          const { client, region } = await getProviderClientById(fileData.providerId)

          const objectKey = fileData.objectKey
          console.log(
            '[getOwnedFileRedirectUrlFn] Generating view URL with region:',
            region,
            {
              fileId,
              providerId: fileData.providerId,
              bucketName: fileData.bucketName,
              objectKey,
            },
          )
          viewUrl = await getSignedUrl(
            client,
            new GetObjectCommand({
              Bucket: fileData.bucketName,
              Key: objectKey,
              ResponseContentDisposition: `inline; filename="${fileData.name}"`,
              ResponseContentType:
                fileData.mimeType || 'application/octet-stream',
            }),
            { expiresIn: 3600 },
          )
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Unknown error'
          console.error(
            '[getOwnedFileRedirectUrlFn] Failed to generate presigned URL:',
            {
              fileId,
              providerId: fileData.providerId,
              bucketName: fileData.bucketName,
              error: message,
            },
          )
          throw new Error(
            `Failed to generate view URL: ${message}. ` +
              `The storage provider may be misconfigured or have region mismatch.`,
          )
        }

        return { url: viewUrl }
      },
    )
  })
