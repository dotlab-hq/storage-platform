import { createFileRoute } from '@tanstack/react-router'
import { getAuthenticatedUser } from '@/lib/server-auth'

export const Route = createFileRoute(
  '/api/storage/upload-multipart-complete' as never,
)({
  component: () => null,
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authUser = await getAuthenticatedUser()
          const body = (await request.json()) as {
            objectKey?: string
            uploadId?: string
            providerId?: string | null
          }

          if (!body.objectKey || typeof body.objectKey !== 'string') {
            return Response.json(
              { error: 'Missing objectKey' },
              { status: 400 },
            )
          }
          if (!body.uploadId || typeof body.uploadId !== 'string') {
            return Response.json({ error: 'Missing uploadId' }, { status: 400 })
          }

          const { getProviderClientById } =
            await import('@/lib/s3-provider-client')
          const { ListPartsCommand, CompleteMultipartUploadCommand } =
            await import('@aws-sdk/client-s3')

          const provider = await getProviderClientById(body.providerId ?? null)

          const listedParts = await provider.client.send(
            new ListPartsCommand({
              Bucket: provider.bucketName,
              Key: body.objectKey,
              UploadId: body.uploadId,
            }),
          )

          const parts = (listedParts.Parts ?? [])
            .filter((part): part is { ETag: string; PartNumber: number } => {
              return Boolean(part.ETag && part.PartNumber)
            })
            .sort((a, b) => a.PartNumber - b.PartNumber)

          if (parts.length === 0) {
            return Response.json(
              { error: 'No uploaded parts were found for this upload session' },
              { status: 400 },
            )
          }

          await provider.client.send(
            new CompleteMultipartUploadCommand({
              Bucket: provider.bucketName,
              Key: body.objectKey,
              UploadId: body.uploadId,
              MultipartUpload: {
                Parts: parts.map((part) => ({
                  ETag: part.ETag,
                  PartNumber: part.PartNumber,
                })),
              },
            }),
          )

          return Response.json({ ok: true, userId: authUser.id })
        } catch (error) {
          console.error('[Server] Multipart upload complete error:', error)
          const msg = error instanceof Error ? error.message : String(error)
          return Response.json({ error: msg }, { status: 500 })
        }
      },
    },
  },
})
