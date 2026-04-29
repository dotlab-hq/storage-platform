import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder } from '@/db/schema/storage'
import { deleteNodeByEntity } from '@/lib/storage-btree/index'
import {
  invalidateFolderCache,
  invalidateQuotaCache,
} from '@/lib/cache-invalidation'
import type { TrashDeletionItem } from './params'
import { getTrashDeletionDO } from './do-client'

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
  userId: string,
  childFileIds: string[],
  childFolderIds: string[],
): Promise<number> {
  let marked = 0
  const now = new Date()

  for (const fileId of childFileIds) {
    const result = await db
      .update(file)
      .set({ isDeleted: true, isTrashed: false, updatedAt: now })
      .where(
        and(
          eq(file.id, fileId),
          eq(file.userId, userId),
          eq(file.isDeleted, false),
        ),
      )
    marked += (result as any).changes ?? 0
  }

  for (const childFolderId of childFolderIds) {
    const result = await db
      .update(folder)
      .set({ isDeleted: true, isTrashed: false, updatedAt: now })
      .where(
        and(
          eq(folder.id, childFolderId),
          eq(folder.userId, userId),
          eq(folder.isDeleted, false),
        ),
      )
    marked += (result as any).changes ?? 0
  }

  return marked
}

export async function deleteFolder(
  env: Env,
  item: TrashDeletionItem,
): Promise<void> {
  const { itemId: folderId, userId } = item

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
      `[Deletion] Skipping folder ${folderId}: not marked for deletion (restored?)`,
    )
    // Still mark as processed for parent tracking
    if (initialCheck.length > 0) {
      try {
        const trashDO = await getTrashDeletionDO(env)
        await trashDO.markChildProcessed(
          initialCheck[0].parentFolderId ?? null,
          folderId,
        )
      } catch (error) {
        console.error(
          '[Deletion] Failed to mark restored folder as processed:',
          error,
        )
      }
    }
    return
  }

  const { fileIds, folderIds } = await processFolderChildren(
    env,
    userId,
    folderId,
  )

  if (fileIds.length > 0 || folderIds.length > 0) {
    const markedCount = await enqueueFolderChildren(userId, fileIds, folderIds)
    console.log(
      `[Deletion] Folder ${folderId}: marked ${markedCount} children for deletion (${fileIds.length} files, ${folderIds.length} subfolders)`,
    )
    return
  }

  console.log(`[Deletion] Folder ${folderId} is empty, deleting permanently`)
  // Fetch folder info including parent and isDeleted (re-check)
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
      `[Deletion] Skipping folder ${folderId}: not marked for deletion (restored?)`,
    )
    // Ensure parent knows this child is done
    if (folderInfo.length > 0) {
      try {
        const trashDO = await getTrashDeletionDO(env)
        await trashDO.markChildProcessed(
          folderInfo[0].parentFolderId ?? null,
          folderId,
        )
      } catch (error) {
        console.error(
          '[Deletion] Failed to mark restored folder as processed:',
          error,
        )
      }
    }
    return
  }

  const parentRows = folderInfo

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
    console.log('[Deletion] Folders ready for completion:', completedFolders)

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
          `[Deletion] Folder ${folderId} restored before deletion, skipping`,
        )
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
