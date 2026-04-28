import { eq, and, inArray, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder } from '@/db/schema/storage'
import type { TrashDeletionItem } from './params'
import { enqueueTrashDeletionItems } from './producer'

/**
 * Find deleted items that have not yet been handed off to the queue.
 * Returns only top-level items whose parent is NOT in trash.
 */
export async function getDeletableItems(
  limit: number = 1000,
): Promise<TrashDeletionItem[]> {
  const items: TrashDeletionItem[] = []

  console.log('Querying for deleted items with no queue handoff...')

  const candidateFolders = await db
    .select({
      id: folder.id,
      userId: folder.userId,
      parentFolderId: folder.parentFolderId,
    })
    .from(folder)
    .where(and(eq(folder.isDeleted, true), isNull(folder.deletionQueuedAt)))
    .limit(limit)

  console.log('Candidate folders found:', candidateFolders.length)

  // Filter to only top-level folders (parent not in trash)
  for (const f of candidateFolders) {
    if (!f.parentFolderId) {
      items.push({ userId: f.userId, itemId: f.id, itemType: 'folder' })
      continue
    }
    const parent = await db
      .select({ id: folder.id, isDeleted: folder.isDeleted })
      .from(folder)
      .where(eq(folder.id, f.parentFolderId))
      .limit(1)
    if (parent.length === 0 || !parent[0].isDeleted) {
      items.push({ userId: f.userId, itemId: f.id, itemType: 'folder' })
    }
  }

  const candidateFiles = await db
    .select({
      id: file.id,
      userId: file.userId,
      folderId: file.folderId,
    })
    .from(file)
    .where(and(eq(file.isDeleted, true), isNull(file.deletionQueuedAt)))
    .limit(limit)

  console.log('Candidate files found:', candidateFiles.length)

  // Filter to only files whose parent folder is NOT in trash
  for (const f of candidateFiles) {
    if (!f.folderId) {
      items.push({ userId: f.userId, itemId: f.id, itemType: 'file' })
      continue
    }
    const parent = await db
      .select({ id: folder.id, isDeleted: folder.isDeleted })
      .from(folder)
      .where(eq(folder.id, f.folderId))
      .limit(1)
    if (parent.length === 0 || !parent[0].isDeleted) {
      items.push({ userId: f.userId, itemId: f.id, itemType: 'file' })
    }
  }

  console.log('Total deletable items:', items.length)
  if (items.length > 0) {
    console.log('Sample item:', items[0])
  }

  return items
}

/**
 * Claim items for queue handoff by setting deletionQueuedAt.
 */
export async function claimItems(items: TrashDeletionItem[]): Promise<number> {
  if (items.length === 0) return 0

  const now = new Date()

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
      .set({
        isDeleted: true,
        deletedAt: now,
        deletionQueuedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          inArray(file.id, fileIds),
          eq(file.isDeleted, true),
          isNull(file.deletionQueuedAt),
        ),
      )
    affected += result.changes ?? 0
  }

  if (folderIds.length > 0) {
    const result = await db
      .update(folder)
      .set({
        isDeleted: true,
        deletedAt: now,
        deletionQueuedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          inArray(folder.id, folderIds),
          eq(folder.isDeleted, true),
          isNull(folder.deletionQueuedAt),
        ),
      )
    affected += result.changes ?? 0
  }

  return affected
}

/**
 * Enqueue a batch of items to the Cloudflare Queue.
 */
export async function enqueueItems(
  queue: { send: (msg: TrashDeletionItem) => Promise<void> },
  items: TrashDeletionItem[],
): Promise<number> {
  return enqueueTrashDeletionItems(queue, items)
}
