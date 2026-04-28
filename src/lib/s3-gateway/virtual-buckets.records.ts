import { and, eq, like } from 'drizzle-orm'
import { db } from '@/db'
import { file } from '@/db/schema/storage'
import type { BucketContext } from '@/lib/s3-gateway/s3-context'
import { deleteNodeByEntity } from '@/lib/storage-btree/index'

export async function removeS3ObjectRecordsByPrefix(
  userId: string,
  bucket: BucketContext,
  prefix: string,
): Promise<void> {
  try {
    const rows = await db
      .select({ id: file.id })
      .from(file)
      .where(
        and(
          eq(file.userId, userId),
          eq(file.isDeleted, true),
          like(file.objectKey, prefix),
        ),
      )

    await db
      .delete(file)
      .where(and(eq(file.userId, userId), like(file.objectKey, prefix)))

    await Promise.all(
      rows.map((row) => deleteNodeByEntity(userId, 'file', row.id)),
    )
  } catch (error) {
    const message =
      error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown'
    console.warn('[S3 Gateway] failed to purge bucket records:', {
      bucket: bucket.bucketName,
      prefix,
      error: message,
    })
  }
}
