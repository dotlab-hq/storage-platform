import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth.server'
import { rotateBucketCredentials } from '@/lib/s3-gateway/virtual-buckets.rotation'

const RotateCredentialsBodySchema = z.object({
  bucketName: z.string().min(1).max(63),
})

function errorToMessage(error: unknown, fallback: string): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? fallback
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}

export const Route = createFileRoute('/api/storage/s3/rotate-credentials')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const currentUser = await getAuthenticatedUser()
          const payload = RotateCredentialsBodySchema.parse(
            await request.json(),
          )
          const { credentials } = await rotateBucketCredentials(
            currentUser.id,
            payload.bucketName,
          )
          return Response.json({ ok: true, credentials })
        } catch (error) {
          const status = error instanceof z.ZodError ? 400 : 500
          return Response.json(
            {
              ok: false,
              error: errorToMessage(error, 'Failed to rotate credentials'),
            },
            { status },
          )
        }
      },
    },
  },
})
