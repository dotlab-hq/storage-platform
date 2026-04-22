import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { listVirtualBucketItems } from '@/lib/s3-gateway/virtual-bucket-items'

const BucketItemsQuerySchema = z.object({
  bucketName: z.string().trim().min(3).max(63),
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

export const Route = createFileRoute('/api/storage/s3/bucket-items' as never)({
  component: () => null,
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const currentUser = await getAuthenticatedUser()
          const url = new URL(request.url)
          const query = BucketItemsQuerySchema.parse({
            bucketName: url.searchParams.get('bucketName'),
          })
          const items = await listVirtualBucketItems(
            currentUser.id,
            query.bucketName,
          )
          return Response.json(items)
        } catch (error) {
          const status = error instanceof z.ZodError ? 400 : 500
          return Response.json({ error: errorToMessage(error) }, { status })
        }
      },
    },
  },
})
