import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { virtualBucket } from '@/db/schema/s3-gateway'
import { z } from 'zod'
import {
  createBucketCredentials,
  getActiveBucketRow,
} from '@/lib/s3-gateway/virtual-buckets.shared'
import { removeBucketContextCache } from '@/lib/s3-gateway/virtual-bucket-kv-cache'
import { logActivity } from '@/lib/activity'
import { isDefaultAssetsBucketName } from '@/lib/storage/assets-bucket'

const RotateCredentialsSchema = z.object({
  bucketName: z.string().min(1).max(63),
})

export async function rotateBucketCredentials(
  userId: string,
  bucketName: string,
): Promise<{
  credentials: Awaited<ReturnType<typeof createBucketCredentials>>
}> {
  const validated = RotateCredentialsSchema.parse({ bucketName })

  const row = await getActiveBucketRow(userId, validated.bucketName)
  if (!row) {
    throw new Error('Virtual bucket not found')
  }

  // Prevent rotating credentials for the default assets bucket
  if (isDefaultAssetsBucketName(row.name)) {
    throw new Error('Cannot rotate credentials for the default assets bucket')
  }

  // Increment credential version
  const [updated] = await db
    .update(virtualBucket)
    .set({ credentialVersion: virtualBucket.credentialVersion + 1 })
    .where(eq(virtualBucket.id, row.id))
    .returning({
      id: virtualBucket.id,
      credentialVersion: virtualBucket.credentialVersion,
    })

  if (updated.length === 0) {
    throw new Error('Failed to update bucket')
  }

  const newVersion = updated[0].credentialVersion

  // Clear cache for this bucket so next resolve picks up new version
  await removeBucketContextCache({
    bucketName: row.name,
    bucketId: row.id,
  })

  // Generate new credentials with new version
  const credentials = createBucketCredentials(
    userId,
    row.id,
    row.name,
    newVersion,
  )

  await logActivity({
    userId,
    eventType: 'bucket_credentials_rotate',
    resourceType: 'bucket',
    resourceId: row.id,
    tags: ['Credentials', 'Bucket'],
    meta: {
      bucketName: row.name,
      newVersion,
    },
  })

  return { credentials }
}
