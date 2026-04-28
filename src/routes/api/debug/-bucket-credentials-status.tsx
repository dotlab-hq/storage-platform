import { json } from '@tanstack/react-start'
import { db } from '@/db'
import { virtualBucket } from '@/db/schema/s3-gateway'
import { isAdminMiddleware } from '@/middlewares/isAdmin'

export const Route = createFileRoute('/api/debug/-bucket-credentials-status')({
  component: () => null,
  server: {
    middleware: [isAdminMiddleware],
    handlers: {
      GET: async ({ context }) => {
        // Admin already verified by middleware; user is in context
        try {
          const buckets = await db
            .select({
              id: virtualBucket.id,
              name: virtualBucket.name,
              userId: virtualBucket.userId,
              createdAt: virtualBucket.createdAt,
              isActive: virtualBucket.isActive,
            })
            .from(virtualBucket)
            .limit(10)

          return json({
            bucketCount: buckets.length,
            buckets,
            message: 'Virtual buckets in database',
          })
        } catch (error) {
          return json({ error: String(error) }, { status: 500 })
        }
      },
    },
  },
})
