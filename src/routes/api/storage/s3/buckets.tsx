import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { apiAuthMiddleware } from '@/middlewares/api-auth'
import {
  createVirtualBucket,
  ensureDefaultAssetsBucket,
  listVirtualBuckets,
} from '@/lib/s3-gateway/virtual-buckets'

const CreateBucketSchema = z.object({
  bucketName: z
    .string()
    .trim()
    .min(3)
    .max(63)
    .regex(/^[a-z0-9][a-z0-9.-]+[a-z0-9]$/, 'Invalid bucket name'),
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

export const Route = createFileRoute('/api/storage/s3/buckets')({
  component: () => null,
  server: {
    middleware: [apiAuthMiddleware],
    handlers: {
      GET: async ({ context }) => {
        try {
          const { user: currentUser } = context
          await ensureDefaultAssetsBucket(currentUser.id)
          const buckets = await listVirtualBuckets(currentUser.id)
          return Response.json({ buckets })
        } catch (error) {
          return Response.json(
            { error: errorToMessage(error, 'Failed to list buckets') },
            { status: 500 },
          )
        }
      },
      POST: async ({ request, context }) => {
        try {
          const { user: currentUser } = context
          const payload = CreateBucketSchema.parse(await request.json())
          const bucket = await createVirtualBucket(
            currentUser.id,
            payload.bucketName,
          )
          return Response.json({ ok: true, bucket })
        } catch (error) {
          let status = 500
          if (error instanceof z.ZodError) {
            status = 400
          } else if (
            error instanceof Error &&
            error.message.includes('already exists')
          ) {
            status = 409
          }
          return Response.json(
            {
              ok: false,
              error: errorToMessage(error, 'Failed to create bucket'),
            },
            { status },
          )
        }
      },
    },
  },
})
