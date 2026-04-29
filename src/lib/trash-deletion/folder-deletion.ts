import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder } from '@/db/schema/storage'
import { deleteNodeByEntity } from '@/lib/storage-btree/index'
import {
  invalidateFolderCache,
  invalidateQuotaCache,
} from '@/lib/cache-invalidation'
import type { TrashDeletionItem } from './params'
import { getTrashDeletionDO, type QueueClient } from './do-client'

export async function processFolderChildren(
  env: Env,
  userId: string,
  folderId: string,
): Promise<{ fileIds: string[]; folderIds: string[] }> {
  const childFolders = await db
    .select({ id: folder.id })
    .from(folder)
    .where(and(eq(folder.parentFolderId, folderId), eq(folder.userId, userId)))

  const childFiles = await db
    .select({ id: file.id })
    .from(file)
    .where(and(eq(file.folderId, folderId), eq(file.userId, userId)))

  const childFolderIds = childFolders.map((childFolder) => childFolder.id)
  const childFileIds = childFiles.map((childFile) => childFile.id)

  if (childFolderIds.length === 0 && childFileIds.length === 0) {
    return { fileIds: [], folderIds: [] }
  }

  try {
    const trashDO = await getTrashDeletionDO(env)
    await trashDO.enqueueChildrenForFolder(
      folderId,
      childFileIds,
      childFolderIds,
    )
  } catch (error) {
    console.error('[Deletion] Failed to track folder children in DO:', error)
  }

  return { fileIds: childFileIds, folderIds: childFolderIds }
}

export async function enqueueFolderChildren(
  queue: QueueClient,
  userId: string,
  childFileIds: string[],
  childFolderIds: string[],
): Promise<number> {
  let enqueued = 0
  const now = new Date()

  for (const fileId of childFileIds) {
    await db
      .update(file)
      .set({
        isDeleted: true,
        isTrashed: false,
        deletedAt: now,
        deletionQueuedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(file.id, fileId),
          eq(file.userId, userId),
          isNull(file.deletionQueuedAt),
        ),
      )

    await queue.send(
      JSON.stringify({ userId, itemId: fileId, itemType: 'file' }),
    )
    enqueued++
  }

  for (const childFolderId of childFolderIds) {
    await db
      .update(folder)
      .set({
        isDeleted: true,
        isTrashed: false,
        deletedAt: now,
        deletionQueuedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(folder.id, childFolderId),
          eq(folder.userId, userId),
          isNull(folder.deletionQueuedAt),
        ),
      )

    await queue.send(
      JSON.stringify({ userId, itemId: childFolderId, itemType: 'folder' }),
    )
    enqueued++
  }

  return enqueued
}

export async function deleteFolder(
  env: Env,
  item: TrashDeletionItem,
  queue: QueueClient,
): Promise<void> {
  const { itemId: folderId, userId } = item
  const { fileIds, folderIds } = await processFolderChildren(
    env,
    userId,
    folderId,
  )

  if (fileIds.length > 0 || folderIds.length > 0) {
    const enqueuedCount = await enqueueFolderChildren(
      queue,
      userId,
      fileIds,
      folderIds,
    )
    console.log(
      `[Deletion] Folder ${folderId}: enqueued ${enqueuedCount} children (${fileIds.length} files, ${folderIds.length} subfolders)`,
    )
    return
  }

  console.log(`[Deletion] Folder ${folderId} is empty, deleting permanently`)
  const parentRows = await db
    .select({ parentFolderId: folder.parentFolderId })
    .from(folder)
    .where(eq(folder.id, folderId))
    .limit(1)

  await db.delete(folder).where(eq(folder.id, folderId))
  await deleteNodeByEntity(userId, 'folder', folderId)

  try {
    const trashDO = await getTrashDeletionDO(env)
    await trashDO.markChildProcessed(
      parentRows[0]?.parentFolderId ?? null,
      folderId,
    )
    await trashDO.clearFolderState(folderId)
  } catch (error) {
    console.error('[Deletion] Failed to clear folder state:', error)
  }

  await invalidateFolderCache(userId, null)
  await invalidateQuotaCache(userId)
}

export async function checkAndDeleteCompletedFolders(
  env: Env,
): Promise<number> {
  let deleted = 0

  try {
    const trashDO = await getTrashDeletionDO(env)
    const completedFolders = await trashDO.getPendingFolderCompletions()

    for (const folderId of completedFolders) {
      const folderRows = await db
        .select({
          userId: folder.userId,
          parentFolderId: folder.parentFolderId,
        })
        .from(folder)
        .where(eq(folder.id, folderId))
        .limit(1)

      if (folderRows.length === 0) {
        await trashDO.clearFolderState(folderId)
        continue
      }

      await db.delete(folder).where(eq(folder.id, folderId))
      await deleteNodeByEntity(folderRows[0].userId, 'folder', folderId)
      await trashDO.markChildProcessed(
        folderRows[0].parentFolderId ?? null,
        folderId,
      )
      await trashDO.clearFolderState(folderId)
      await invalidateFolderCache(folderRows[0].userId, null)
      await invalidateQuotaCache(folderRows[0].userId)
      deleted++
      console.log(
        `[Deletion] Folder ${folderId} deleted (all children processed)`,
      )
    }
  } catch (error) {
    console.error('[Deletion] Error checking completed folders:', error)
  }

  return deleted
}
