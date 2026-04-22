import { db } from '@/db'
import { virtualBucket } from '@/db/schema/s3-gateway'
import { file } from '@/db/schema/storage'
import { and, eq } from 'drizzle-orm'

export async function listVirtualBucketItems(
  userId: string,
  bucketName: string,
) {
  const bucketRows = await db
    .select({
      id: virtualBucket.id,
      mappedFolderId: virtualBucket.mappedFolderId,
    })
    .from(virtualBucket)
    .where(
      and(
        eq(virtualBucket.userId, userId),
        eq(virtualBucket.name, bucketName),
        eq(virtualBucket.isActive, true),
      ),
    )
    .limit(1)

  if (bucketRows.length === 0) {
    throw new Error('Virtual bucket not found')
  }

  const mappedFolderId = bucketRows[0].mappedFolderId
  if (!mappedFolderId) {
    return { files: [] }
  }

  const filesInBucket = await db
    .select({
      id: file.id,
      name: file.name,
      sizeInBytes: file.sizeInBytes,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
      objectKey: file.objectKey,
    })
    .from(file)
    .where(
      and(
        eq(file.userId, userId),
        eq(file.folderId, mappedFolderId),
        eq(file.isDeleted, false),
      ),
    )
    .orderBy(file.createdAt)

  return { files: filesInBucket }
}
