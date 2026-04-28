import { and, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder } from '@/db/schema/storage'
import type { TrashDeletionItem } from './params'

type QueueBinding = {
  send: (message: TrashDeletionItem) => Promise<void>
}

function partitionItems(items: TrashDeletionItem[]) {
  return {
    fileIds: items.filter((item) => item.itemType === 'file').map((item) => item.itemId),
    folderIds: items
      .filter((item) => item.itemType === 'folder')
      .map((item) => item.itemId),
  }
}

export async function enqueueTrashDeletionItems(
  queue: QueueBinding,
  items: TrashDeletionItem[],
): Promise<number> {
  if (items.length === 0) return 0

  const sentItems: TrashDeletionItem[] = []
  const errors: string[] = []

  for (const item of items) {
    try {
      await queue.send(item)
      sentItems.push(item)
    } catch (error) {
      console.error('[Trash Producer] Failed to enqueue item:', item, error)
      errors.push(
        error instanceof Error
          ? `${item.itemType}:${item.itemId}:${error.message}`
          : `${item.itemType}:${item.itemId}:unknown enqueue failure`,
      )
    }
  }

  if (errors.length > 0) {
    throw new Error(`Trash queue enqueue failed for ${errors.join(', ')}`)
  }

  if (sentItems.length === 0) return 0

  const { fileIds, folderIds } = partitionItems(sentItems)
  const queuedAt = new Date()

  if (fileIds.length > 0) {
    await db
      .update(file)
      .set({ deletionQueuedAt: queuedAt })
      .where(
        and(
          inArray(file.id, fileIds),
          eq(file.isDeleted, true),
          isNull(file.deletionQueuedAt),
        ),
      )
  }

  if (folderIds.length > 0) {
    await db
      .update(folder)
      .set({ deletionQueuedAt: queuedAt })
      .where(
        and(
          inArray(folder.id, folderIds),
          eq(folder.isDeleted, true),
          isNull(folder.deletionQueuedAt),
        ),
      )
  }

  return sentItems.length
}

export async function markItemsDeleted(
  userId: string,
  items: TrashDeletionItem[],
): Promise<void> {
  if (items.length === 0) return

  const { fileIds, folderIds } = partitionItems(items)
  const deletedAt = new Date()

  if (fileIds.length > 0) {
    await db
      .update(file)
      .set({
        isDeleted: true,
        isTrashed: false,
        deletedAt,
        deletionQueuedAt: null,
        updatedAt: deletedAt,
      })
      .where(and(inArray(file.id, fileIds), eq(file.userId, userId)))
  }

  if (folderIds.length > 0) {
    await db
      .update(folder)
      .set({
        isDeleted: true,
        isTrashed: false,
        deletedAt,
        deletionQueuedAt: null,
        updatedAt: deletedAt,
      })
      .where(and(inArray(folder.id, folderIds), eq(folder.userId, userId)))
  }
}
