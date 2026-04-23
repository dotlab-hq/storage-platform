import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { virtualBucket } from '@/db/schema/s3-gateway'
import { ensureS3FileSchemaCompatibility } from '@/lib/s3-gateway/s3-file-schema-compat'
import {
  assertMutableBucket,
  getActiveBucketRow,
} from '@/lib/s3-gateway/virtual-buckets.shared'
import {
  decrementUserStorage,
  deleteMappedFolder,
  getActiveBucketFiles,
  hasActiveObjects,
  softDeleteByPrefix,
} from '@/lib/s3-gateway/virtual-buckets.fallback'
import { removeBucketContextCache } from '@/lib/s3-gateway/virtual-bucket-kv-cache'

export async function emptyVirtualBucket(
  userId: string,
  bucketName: string,
): Promise<void> {
  assertMutableBucket(bucketName)
  await ensureS3FileSchemaCompatibility()

  const row = await getActiveBucketRow(userId, bucketName)
  if (!row) {
    throw new Error('Virtual bucket not found')
  }

  const prefix = `s3/${userId}/${row.id}/%`
  const activeFiles = await getActiveBucketFiles(userId, prefix)
  if (activeFiles.length === 0) {
    return
  }

  const totalBytes = activeFiles.reduce(
    (sum, item) => sum + item.sizeInBytes,
    0,
  )
  await softDeleteByPrefix(userId, prefix)
  await decrementUserStorage(userId, totalBytes)
}

export async function deleteVirtualBucket(
  userId: string,
  bucketName: string,
): Promise<void> {
  assertMutableBucket(bucketName)
  await ensureS3FileSchemaCompatibility()

  const row = await getActiveBucketRow(userId, bucketName)
  if (!row) {
    throw new Error('Virtual bucket not found')
  }

  const prefix = `s3/${userId}/${row.id}/%`
  if (await hasActiveObjects(userId, prefix)) {
    throw new Error('Bucket is not empty. Empty it before deleting.')
  }

  await db
    .update(virtualBucket)
    .set({ isActive: false })
    .where(eq(virtualBucket.id, row.id))

  if (row.mappedFolderId) {
    await deleteMappedFolder(userId, row.mappedFolderId)
  }

  await removeBucketContextCache({
    bucketName: row.name,
    bucketId: row.id,
  })
}
