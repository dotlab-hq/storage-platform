import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder } from '@/db/schema/storage'
import { deleteNodeByEntity } from '@/lib/storage-btree/index'
import {
  invalidateFolderCache,
  invalidateQuotaCache,
} from '@/lib/cache-invalidation'
import type { TrashDeletionItem } from './params'
import { getTrashDeletionDO } from './do-client'
import type { QueueClient } from './do-client'

export async function processFolderChildren(
  env: Env,
  userId: string,
  folderId: string,
): Promise<{ fileIds: string[]; folderIds: string[] }> {
  console.log('[Workflow Step] processFolderChildren for folder:', folderId)

  // Fetch children that are marked for deletion but not yet queued
  const childFolders = await db
    .select({ id: folder.id })
    .from(folder)
    .where(
      and(
        eq(folder.parentFolderId, folderId),
        eq(folder.userId, userId),
        eq(folder.isDeleted, true),
        isNull(folder.deletionQueuedAt),
      ),
    )

  const childFiles = await db
    .select({ id: file.id })
    .from(file)
    .where(
      and(
        eq(file.folderId, folderId),
        eq(file.userId, userId),
        eq(file.isDeleted, true),
        isNull(file.deletionQueuedAt),
      ),
    )

  const childFolderIds = childFolders.map((childFolder) => childFolder.id)
  const childFileIds = childFiles.map((childFile) => childFile.id)

  console.log(
    `[Workflow Step] Folder ${folderId} has ${childFileIds.length} child files, ${childFolderIds.length} child folders`,
  )

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
    console.log('[Workflow Step] Tracked children in DO for folder:', folderId)
  } catch (error) {
    console.error(
      '[Workflow Step] Failed to track folder children in DO:',
      error,
    )
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
    const result = await db
      .update(file)
      .set({
        isDeleted: true,
        isTrashed: false,
        deletionQueuedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(file.id, fileId),
          eq(file.userId, userId),
          eq(file.isDeleted, false),
        ),
      )
    const changes = result as any
    if (changes.changes > 0) {
      await queue.send(
        JSON.stringify({ userId, itemId: fileId, itemType: 'file' }),
      )
      enqueued++
      console.log('[Workflow Step] Enqueued child file:', fileId)
    }
  }

  for (const childFolderId of childFolderIds) {
    const result = await db
      .update(folder)
      .set({
        isDeleted: true,
        isTrashed: false,
        deletionQueuedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(folder.id, childFolderId),
          eq(folder.userId, userId),
          eq(folder.isDeleted, false),
        ),
      )
    const changes = result as any
    if (changes.changes > 0) {
      await queue.send(
        JSON.stringify({ userId, itemId: childFolderId, itemType: 'folder' }),
      )
      enqueued++
      console.log('[Workflow Step] Enqueued child folder:', childFolderId)
    }
  }

  return enqueued
}

export async function deleteFolder(
  env: Env,
  item: TrashDeletionItem,
): Promise<void> {
  const { itemId: folderId, userId } = item

  console.log('[Workflow Step] deleteFolder started for:', folderId)

  // Check if folder is still marked for deletion (skip if restored)
  const initialCheck = await db
    .select({
      isDeleted: folder.isDeleted,
      parentFolderId: folder.parentFolderId,
    })
    .from(folder)
    .where(eq(folder.id, folderId))
    .limit(1)

  if (initialCheck.length === 0 || !initialCheck[0].isDeleted) {
    console.log(
      `[Workflow Step] Skipping folder ${folderId}: not marked for deletion (restored?)`,
    )
    if (initialCheck.length > 0) {
      try {
        const trashDO = await getTrashDeletionDO(env)
        await trashDO.markChildProcessed(
          initialCheck[0].parentFolderId ?? null,
          folderId,
        )
      } catch (error) {
        console.error(
          '[Workflow Step] Failed to mark restored folder as processed:',
          error,
        )
      }
    }
    return
  }

  // Children are already marked as deleted when user emptied trash
  // Just delete the folder directly
  console.log(
    `[Workflow Step] Folder ${folderId} is marked for deletion, deleting permanently`,
  )

  const folderInfo = await db
    .select({
      parentFolderId: folder.parentFolderId,
      isDeleted: folder.isDeleted,
    })
    .from(folder)
    .where(eq(folder.id, folderId))
    .limit(1)

  if (folderInfo.length === 0 || !folderInfo[0].isDeleted) {
    console.log(
      `[Workflow Step] Skipping folder ${folderId}: not marked for deletion (restored?)`,
    )
    if (folderInfo.length > 0) {
      try {
        const trashDO = await getTrashDeletionDO(env)
        await trashDO.markChildProcessed(
          folderInfo[0].parentFolderId ?? null,
          folderId,
        )
      } catch (error) {
        console.error(
          '[Workflow Step] Failed to mark restored folder as processed:',
          error,
        )
      }
    }
    return
  }

  const parentRows = folderInfo

  console.log('[Workflow Step] Deleting folder from DB:', folderId)
  await db.delete(folder).where(eq(folder.id, folderId))
  await deleteNodeByEntity(userId, 'folder', folderId)

  try {
    const trashDO = await getTrashDeletionDO(env)
    await trashDO.markChildProcessed(
      parentRows[0]?.parentFolderId ?? null,
      folderId,
    )
    await trashDO.clearFolderState(folderId)
    console.log('[Workflow Step] Folder state cleared:', folderId)
  } catch (error) {
    console.error('[Workflow Step] Failed to clear folder state:', error)
  }

  await invalidateFolderCache(userId, null)
  await invalidateQuotaCache(userId)

  console.log('[Workflow Step] deleteFolder completed for:', folderId)
}

export async function checkAndDeleteCompletedFolders(
  env: Env,
): Promise<number> {
  let deleted = 0

  try {
    const trashDO = await getTrashDeletionDO(env)
    const completedFolders = await trashDO.getPendingFolderCompletions()
    console.log(
      `[Workflow Step] checkAndDeleteCompletedFolders: ${completedFolders.length} folders ready for completion`,
    )

    for (const folderId of completedFolders) {
      const folderRows = await db
        .select({
          userId: folder.userId,
          parentFolderId: folder.parentFolderId,
          isDeleted: folder.isDeleted,
        })
        .from(folder)
        .where(eq(folder.id, folderId))
        .limit(1)

      if (folderRows.length === 0) {
        await trashDO.clearFolderState(folderId)
        continue
      }

      // Skip if folder was restored (no longer marked for deletion)
      if (!folderRows[0].isDeleted) {
        console.log(
          `[Workflow Step] Folder ${folderId} restored before deletion, skipping`,
        )
        await trashDO.clearFolderState(folderId)
        continue
      }

      console.log('[Workflow Step] Deleting completed folder:', folderId)
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
        `[Workflow Step] Folder ${folderId} deleted (all children processed)`,
      )
    }
  } catch (error) {
    console.error('[Workflow Step] Error checking completed folders:', error)
  }

  return deleted
}
