import { eq, and, inArray, sql, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder } from '@/db/schema/storage'
import type { TrashDeletionItem } from './params'

/**
 * Find all items in trash (isTrashed=true) that are not yet queued for deletion
 * (deletionQueuedAt = null) and are top-level (no ancestor is also in trash).
 * Returns up to limit items.
 */
export async function getDeletableItems(
  limit: number = 1000,
): Promise<TrashDeletionItem[]> {
  const items: TrashDeletionItem[] = []

  console.log('Querying for deletable items (isTrashed=true, not queued)...')

  // Get candidate folders: isTrashed=true, deletionQueuedAt IS NULL,
  // and no parent folder also in trash
  const candidateFolders = await db
    .select({
      id: folder.id,
      userId: folder.userId,
    })
    .from(folder)
    .where(
      and(
        eq(folder.isTrashed, true),
        isNull(folder.deletionQueuedAt),
        // Exclude folders whose parent is also in trash (will be handled by parent)
        sql`NOT EXISTS (
            SELECT 1 FROM folder parent
            WHERE parent.id = folder.parent_folder_id
              AND parent.is_trashed = true
          )`,
      ),
    )
    .limit(limit)

  console.log('Candidate folders found:', candidateFolders.length)
  if (candidateFolders.length > 0) {
    console.log('Sample folder:', candidateFolders[0])
  }

  for (const f of candidateFolders) {
    items.push({ userId: f.userId, itemId: f.id, itemType: 'folder' })
  }

  // Get candidate files: isDeleted=true, deletedAt IS NOT NULL, deletionQueuedAt IS NULL,
  // and their folder (if any) is not also marked for deletion
  const candidateFiles = await db
    .select({
      id: file.id,
      userId: file.userId,
      folderId: file.folderId,
    })
    .from(file)
    .where(
      and(
        eq(file.isTrashed, true),
        isNull(file.deletionQueuedAt),
        // Exclude files that are inside a trashed folder (those will be handled with folder)
        sql`NOT EXISTS (
            SELECT 1 FROM folder f2
            WHERE f2.id = file.folder_id
              AND f2.is_trashed = true
          )`,
      ),
    )
    .limit(limit)

  for (const f of candidateFiles) {
    items.push({ userId: f.userId, itemId: f.id, itemType: 'file' })
  }

  // Sort by oldest deletedAt? Actually we don't have deletedAt in query; we could order by deletedAt.
  // For now order doesn't matter; we'll just return as is.
  return items
}

/**
 * Claim items for deletion by setting deletionQueuedAt = now.
 * Updates only if deletionQueuedAt is still NULL (atomic).
 * Returns the number of rows claimed.
 */
export async function claimItems(items: TrashDeletionItem[]): Promise<number> {
  if (items.length === 0) return 0

  const now = new Date()

  // Claim files
  const fileIds = items
    .filter((i) => i.itemType === 'file')
    .map((i) => i.itemId)
  const folderIds = items
    .filter((i) => i.itemType === 'folder')
    .map((i) => i.itemId)

  let affected = 0

  if (fileIds.length > 0) {
    const result = await db
      .update(file)
      .set({ deletionQueuedAt: now })
      .where(
        and(
          inArray(file.id, fileIds),
          eq(file.isTrashed, false),
          sql`${file.deletedAt} IS NOT NULL`,
          isNull(file.deletionQueuedAt),
        ),
      )
    affected += result.changes ?? 0
  }

  if (folderIds.length > 0) {
    const result = await db
      .update(folder)
      .set({ deletionQueuedAt: now })
      .where(
        and(
          inArray(folder.id, folderIds),
          eq(folder.isTrashed, false),
          sql`${folder.deletedAt} IS NOT NULL`,
          isNull(folder.deletionQueuedAt),
        ),
      )
    affected += result.changes ?? 0
  }

  return affected
}

/**
 * Enqueue a batch of items to the Cloudflare Queue.
 * Returns number of messages successfully sent.
 */
export async function enqueueItems(
  queue: { send: (msg: TrashDeletionItem) => Promise<void> },
  items: TrashDeletionItem[],
): Promise<number> {
  let sent = 0
  for (const item of items) {
    try {
      await queue.send(item)
      sent++
    } catch (err) {
      console.error('Failed to enqueue deletion item:', err)
    }
  }
  return sent
}
