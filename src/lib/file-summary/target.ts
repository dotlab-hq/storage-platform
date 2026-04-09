import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { file as storageFile } from '@/db/schema/storage'
import { storageProvider } from '@/db/schema/storage-provider'
import type { FileSummaryTarget } from './types'

export async function getSummaryTarget(
  fileId: string,
  userId: string,
): Promise<FileSummaryTarget> {
  const [row] = await db
    .select({
      fileId: storageFile.id,
      userId: storageFile.userId,
      name: storageFile.name,
      mimeType: storageFile.mimeType,
      sizeInBytes: storageFile.sizeInBytes,
      objectKey: storageFile.objectKey,
      providerId: storageFile.providerId,
      providerName: storageProvider.name,
      bucketName: storageProvider.bucketName,
      createdAt: storageFile.createdAt,
      updatedAt: storageFile.updatedAt,
    })
    .from(storageFile)
    .leftJoin(storageProvider, eq(storageProvider.id, storageFile.providerId))
    .where(
      and(
        eq(storageFile.id, fileId),
        eq(storageFile.userId, userId),
        eq(storageFile.isDeleted, false),
      ),
    )
    .limit(1)

  if (!row) {
    throw new Error('File not found or access denied.')
  }

  return {
    fileId: row.fileId,
    userId: row.userId,
    name: row.name,
    mimeType: row.mimeType,
    sizeInBytes: row.sizeInBytes,
    objectKey: row.objectKey,
    providerId: row.providerId,
    providerName: row.providerName ?? null,
    bucketName: row.bucketName ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
