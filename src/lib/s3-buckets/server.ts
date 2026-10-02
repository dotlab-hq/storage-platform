import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { apiAuthMiddleware } from '@/middlewares/api-auth'
import type { S3BucketItem } from '@/types/s3-buckets'

const BucketItemsSchema = z.object({
  bucketName: z.string().trim().min(1).max(63),
  prefix: z.string(),
  continuationToken: z.string().optional(),
  maxKeys: z.number().int().min(1).max(1000),
})

/** Lists the signed-in user's virtual buckets (creating the default one if missing). */
export const listBucketsFn = createServerFn({ method: 'GET' })
  .middleware([apiAuthMiddleware])
  .handler(async ({ context }): Promise<S3BucketItem[]> => {
    const { ensureDefaultAssetsBucket, listVirtualBuckets } =
      await import('@/lib/s3-gateway/virtual-buckets.server')
    await ensureDefaultAssetsBucket(context.user.id)
    return listVirtualBuckets(context.user.id)
  })

/** Lists one page of folders/objects directly under `prefix` in a bucket. */
export const listBucketItemsFn = createServerFn({ method: 'GET' })
  .middleware([apiAuthMiddleware])
  .inputValidator(BucketItemsSchema)
  .handler(async ({ data, context }) => {
    const { listBucketItems } =
      await import('@/lib/s3-gateway/list-bucket-items.server')
    return listBucketItems({ userId: context.user.id, ...data })
  })
