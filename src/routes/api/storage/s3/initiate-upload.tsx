import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth.server'
import { initiateUpload } from '@/lib/s3-gateway/upload-attempts'

const InitiateUploadSchema = z.object({
  bucket: z.string().min(3).max(63),
  key: z.string().min(1),
  fileSize: z.number().int().positive(),
  contentType: z.string().min(1),
})

export const Route = createFileRoute('/api/storage/s3/initiate-upload')({
  component: () => null,
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const currentUser = await getAuthenticatedUser()
          const payload = InitiateUploadSchema.parse(await request.json())
          const result = await initiateUpload({
            userId: currentUser.id,
            bucketName: payload.bucket,
            objectKey: payload.key,
            fileSize: payload.fileSize,
            contentType: payload.contentType,
          })

          return Response.json({
            uploadId: result.uploadId,
            providerId: result.providerId,
            presignedUrl: result.presignedUrl,
            expiresAt: result.expiresAt,
            headers: result.headers,
          })
        } catch (error) {
          const message =
            error instanceof z.ZodError
              ? 'Invalid upload initiate payload'
              : error instanceof Error
                ? error.message
                : 'Failed to initiate upload'
          const status = error instanceof z.ZodError ? 400 : 500
          return Response.json({ error: message }, { status })
        }
      },
    },
  },
})
