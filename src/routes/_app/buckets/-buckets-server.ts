import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth.server'
import { listVirtualBucketItems } from '@/lib/s3-gateway/virtual-bucket-items'

const BucketItemsInputSchema = z.object({
  bucketName: z.string().trim().min(3).max(63),
})

export const getBucketItemsFn = createServerFn({ method: 'GET' })
  .inputValidator(BucketItemsInputSchema)
  .handler(async ({ data }) => {
    const currentUser = await getAuthenticatedUser()
    return listVirtualBucketItems(currentUser.id, data.bucketName)
  })
