import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { apiAuthMiddleware } from '@/middlewares/api-auth'
import { listVirtualBucketItems } from '@/lib/s3-gateway/virtual-bucket-items'

const BucketItemsInputSchema = z.object({
  bucketName: z.string().trim().min(3).max(63),
})

export const getBucketItemsFn = createServerFn({ method: 'GET' })
  .use(apiAuthMiddleware)
  .inputValidator(BucketItemsInputSchema)
  .handler(async ({ data, context }) => {
    const currentUser = context.user
    return listVirtualBucketItems(currentUser.id, data.bucketName)
  })
