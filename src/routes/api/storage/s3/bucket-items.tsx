import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { listBucketItems } from '@/lib/s3-gateway/list-bucket-items.server'

const BucketItemsQuerySchema = z.object({
  bucketName: z.string().trim().min(1).max(63),
  prefix: z.string().optional(),
  continuationToken: z.string().optional(),
  maxKeys: z.coerce.number().int().min(1).max(1000).optional().default(250),
})

function errorToMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? 'Invalid request'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Failed to list bucket files'
}

export const Route = createFileRoute('/api/storage/s3/bucket-items')({
  component: () => null,
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const currentUser = await getAuthenticatedUser()
          const url = new URL(request.url)
          const query = BucketItemsQuerySchema.parse({
            bucketName: url.searchParams.get('bucketName'),
            prefix: url.searchParams.get('prefix') ?? undefined,
            continuationToken:
              url.searchParams.get('continuationToken') ?? undefined,
            maxKeys: url.searchParams.get('maxKeys') ?? undefined,
          })

          const response = await listBucketItems({
            userId: currentUser.id,
            bucketName: query.bucketName,
            prefix: query.prefix,
            continuationToken: query.continuationToken,
            maxKeys: query.maxKeys,
          })

          return Response.json(response)
        } catch (error) {
          const message = errorToMessage(error)
          const status =
            message === 'Virtual bucket not found'
              ? 404
              : message === 'Unauthorized'
                ? 401
                : error instanceof z.ZodError
                  ? 400
                  : 500
          return Response.json({ error: message }, { status })
        }
      },
    },
  },
})
