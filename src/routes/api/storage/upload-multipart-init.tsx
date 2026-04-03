import { createFileRoute } from '@tanstack/react-router'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { selectProviderForUpload } from '@/lib/s3-provider-client'
import { DEFAULT_FILE_SIZE_LIMIT_BYTES } from '@/lib/storage-quota-constants'

const MAX_MULTIPART_PARTS = 10000

export const Route = createFileRoute(
  '/api/storage/upload-multipart-init' as never,
)({
  component: () => null,
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authUser = await getAuthenticatedUser()
          const body = (await request.json()) as {
            objectKey?: string
            contentType?: string
            fileSize?: number
            partCount?: number
          }

          if (!body.objectKey || typeof body.objectKey !== 'string') {
            return Response.json(
              { error: 'Missing objectKey' },
              { status: 400 },
            )
          }
          if (!body.contentType || typeof body.contentType !== 'string') {
            return Response.json(
              { error: 'Missing contentType' },
              { status: 400 },
            )
          }
          if (typeof body.fileSize !== 'number' || body.fileSize <= 0) {
            return Response.json({ error: 'Invalid fileSize' }, { status: 400 })
          }
          if (
            typeof body.partCount !== 'number' ||
            !Number.isInteger(body.partCount) ||
            body.partCount <= 0 ||
            body.partCount > MAX_MULTIPART_PARTS
          ) {
            return Response.json(
              { error: 'Invalid partCount' },
              { status: 400 },
            )
          }

          const [{ db }, { userStorage }] = await Promise.all([
            import('@/db'),
            import('@/db/schema/storage'),
          ])
          const { eq } = await import('drizzle-orm')

          const storageRows = await db
            .select({ fileSizeLimit: userStorage.fileSizeLimit })
            .from(userStorage)
            .where(eq(userStorage.userId, authUser.id))
            .limit(1)
          const fileSizeLimit =
            storageRows[0]?.fileSizeLimit ?? DEFAULT_FILE_SIZE_LIMIT_BYTES

          if (body.fileSize > fileSizeLimit) {
            return Response.json(
              {
                error: `File exceeds your maximum allowed size (${fileSizeLimit} bytes)`,
                code: 'FILE_SIZE_LIMIT_EXCEEDED',
                fileSizeLimit,
              },
              { status: 403 },
            )
          }

          const { CreateMultipartUploadCommand, UploadPartCommand } =
            await import('@aws-sdk/client-s3')
          const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
          const provider = await selectProviderForUpload(body.fileSize)

          const createMultipartResult = await provider.client.send(
            new CreateMultipartUploadCommand({
              Bucket: provider.bucketName,
              Key: body.objectKey,
              ContentType: body.contentType,
            }),
          )

          const uploadId = createMultipartResult.UploadId
          if (!uploadId) {
            throw new Error('Failed to create multipart upload session')
          }

          const presignedPartUrls = await Promise.all(
            Array.from({ length: body.partCount }, async (_, index) => {
              const partNumber = index + 1
              const command = new UploadPartCommand({
                Bucket: provider.bucketName,
                Key: body.objectKey,
                UploadId: uploadId,
                PartNumber: partNumber,
              })
              const presignedUrl = await getSignedUrl(
                provider.client,
                command,
                {
                  expiresIn: 3600,
                },
              )
              return { partNumber, presignedUrl }
            }),
          )

          return Response.json({
            uploadId,
            providerId: provider.providerId,
            partUrls: presignedPartUrls,
          })
        } catch (error) {
          console.error('[Server] Multipart upload init error:', error)
          const msg = error instanceof Error ? error.message : String(error)
          return Response.json({ error: msg }, { status: 500 })
        }
      },
    },
  },
})
