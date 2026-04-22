import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { completeUpload } from '@/lib/s3-gateway/upload-attempts'

const CompleteUploadSchema = z.object({
  uploadId: z.string().uuid(),
  etag: z.string().trim().min(1).optional(),
})

export const Route = createFileRoute(
  '/api/storage/s3/complete-upload' as never,
)({
  component: () => null,
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const currentUser = await getAuthenticatedUser()
          const payload = CompleteUploadSchema.parse(await request.json())
          const file = await completeUpload(
            currentUser.id,
            payload.uploadId,
            payload.etag,
          )
          return Response.json({ status: 'uploaded', file })
        } catch (error) {
          const message =
            error instanceof z.ZodError
              ? 'Invalid upload completion payload'
              : error instanceof Error
                ? error.message
                : 'Failed to complete upload'
          const status = error instanceof z.ZodError ? 400 : 500
          return Response.json({ error: message }, { status })
        }
      },
    },
  },
})
