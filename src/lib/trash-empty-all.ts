import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { file as storageFile, folder } from '@/db/schema/storage'
import { seedNodeById } from '@/lib/storage-btree/seed'
import { markFolderSubtreesForDeletionSchedule } from '@/lib/trash-state'

const SEED_BATCH_SIZE = 200

async function seedFilesByDeletedAt(
  userId: string,
  deletedAt: Date,
): Promise<void> {
  let offset = 0

  while (true) {
    const batch = await db
      .select({ id: storageFile.id })
      .from(storageFile)
      .where(
        and(
          eq(storageFile.userId, userId),
          eq(storageFile.isTrashed, true),
          eq(storageFile.isDeleted, true),
          eq(storageFile.deletedAt, deletedAt),
        ),
      )
      .limit(SEED_BATCH_SIZE)
      .offset(offset)

    if (batch.length === 0) return

    await Promise.all(
      batch.map((row) => seedNodeById(userId, 'file', row.id)),
    )

    if (batch.length < SEED_BATCH_SIZE) return
    offset += SEED_BATCH_SIZE
  }
}

export async function emptyAllTrashForUser(
  userId: string,
): Promise<{ deletedFiles: number; deletedFolders: number }> {
  const deletedAt = new Date()

  const [trashedFileCountRow, folderRows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(storageFile)
      .where(
        and(
          eq(storageFile.userId, userId),
          eq(storageFile.isTrashed, true),
          eq(storageFile.isDeleted, false),
        ),
      ),
    db
      .select({ id: folder.id })
      .from(folder)
      .where(
        and(
          eq(folder.userId, userId),
          eq(folder.isTrashed, true),
          eq(folder.isDeleted, false),
        ),
      ),
  ])

  const trashedFileCount = Number(trashedFileCountRow?.count ?? 0)
  const folderIds = folderRows.map((row) => row.id)

  await db
    .update(storageFile)
    .set({
      isTrashed: true,
      isDeleted: true,
      deletedAt,
      deletionQueuedAt: null,
      updatedAt: deletedAt,
    })
    .where(
      and(
        eq(storageFile.userId, userId),
        eq(storageFile.isTrashed, true),
        eq(storageFile.isDeleted, false),
      ),
    )

  const deletedFolderResult =
    folderIds.length > 0
      ? await markFolderSubtreesForDeletionSchedule(userId, folderIds, deletedAt)
      : { fileIds: [], folderIds: [] }

  if (trashedFileCount > 0 || deletedFolderResult.fileIds.length > 0) {
    await seedFilesByDeletedAt(userId, deletedAt)
  }

  const { invalidateFolderCache, invalidateQuotaCache } = await import(
    '@/lib/cache-invalidation'
  )
  await invalidateQuotaCache(userId)
  await invalidateFolderCache(userId, null)

  return {
    deletedFiles: trashedFileCount + deletedFolderResult.fileIds.length,
    deletedFolders: deletedFolderResult.folderIds.length,
  }
}
