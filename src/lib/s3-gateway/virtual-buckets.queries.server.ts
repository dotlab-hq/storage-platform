import { db } from '@/db'
import { virtualBucket } from '@/db/schema/s3-gateway'
import type { S3BucketCredentials, S3BucketItem } from '@/types/s3-buckets'
import { and, eq } from 'drizzle-orm'
import {
  createBucketCredentials,
  getActiveBucketRow,
  getUserDefaultAssetsBucketName,
  toBucketItem,
} from '@/lib/s3-gateway/virtual-buckets.shared'

export async function listVirtualBuckets(
  userId: string,
): Promise<S3BucketItem[]> {
  const [defaultName, rows] = await Promise.all([
    getUserDefaultAssetsBucketName(userId),
    db
      .select({
        id: virtualBucket.id,
        name: virtualBucket.name,
        mappedFolderId: virtualBucket.mappedFolderId,
        isActive: virtualBucket.isActive,
        createdAt: virtualBucket.createdAt,
      })
      .from(virtualBucket)
      .where(
        and(eq(virtualBucket.userId, userId), eq(virtualBucket.isActive, true)),
      )
      .orderBy(virtualBucket.createdAt),
  ])

  return Promise.all(rows.map((row) => toBucketItem(row, defaultName)))
}

export async function getVirtualBucketCredentials(
  userId: string,
  bucketName: string,
): Promise<S3BucketCredentials> {
  const row = await getActiveBucketRow(userId, bucketName)
  if (!row) {
    throw new Error('Virtual bucket not found')
  }

  // Delegate region handling to createBucketCredentials which guarantees non-empty region
  const credentials = createBucketCredentials(
    userId,
    row.id,
    row.name,
    row.credentialVersion,
    row.region,
  )

  return credentials
}
