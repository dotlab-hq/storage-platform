import { eq, and, inArray, sql, isNull, desc } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder } from '@/db/schema/storage'
import { getProviderClientById } from '@/lib/s3-provider-client'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { deleteNodeByEntity } from '@/lib/storage-btree/index'
import {
  invalidateFolderCache,
  invalidateQuotaCache,
} from '@/lib/cache-invalidation'
import type { TrashDeletionItem } from './params'

interface QueueClient {
  send: (msg: TrashDeletionItem) => Promise<void>
}

async function getTrashDeletionDO(env: Env) {
  const id = env.TRASH_DELETION_STATE.idFromName('trash-deletion-state')
  return env.TRASH_DELETION_STATE.get(id)
}

export async function deleteFile(item: TrashDeletionItem): Promise<void> {
  const { itemId: fileId, userId } = item

  const fileRows = await db
    .select({
      objectKey: file.objectKey,
      sizeInBytes: file.sizeInBytes,
      providerId: file.providerId,
      folderId: file.folderId,
    })
    .from(file)
    .where(and(eq(file.id, fileId), eq(file.userId, userId)))
    .limit(1)

  if (fileRows.length === 0) {
    return
  }

  const fileRow = fileRows[0]

  if (fileRow.providerId) {
    try {
      const provider = await getProviderClientById(fileRow.providerId)
      await provider.client.send(
        new DeleteObjectCommand({
          Bucket: provider.bucketName,
          Key: fileRow.objectKey,
        }),
      )
    } catch (err) {
      console.error(`[Deletion] S3 delete failed for file ${fileId}:`, err)
    }
  }

  await db.delete(file).where(eq(file.id, fileId))
  await deleteNodeByEntity(userId, 'file', fileId)

  if (fileRow.sizeInBytes && fileRow.sizeInBytes > 0) {
    await db
      .update('user_storage')
      .set({ usedStorage: sql`MAX(0, usedStorage - ${fileRow.sizeInBytes})` })
      .where(eq('user_id', userId))
  }

  await invalidateQuotaCache(userId)
  await invalidateFolderCache(userId, fileRow.folderId)
}

export async function processFolderChildren(
  env: Env,
  userId: string,
  folderId: string,
): Promise<{ fileIds: string[]; folderIds: string[] }> {
  const childFolders = await db
    .select({ id: folder.id })
    .from(folder)
    .where(
      and(
        eq(folder.parentFolderId, folderId),
        eq(folder.userId, userId),
        eq(folder.isDeleted, false),
      ),
    )
    .limit(100)

  const childFolderIds = childFolders.map((f) => f.id)

  const childFiles = await db
    .select({ id: file.id })
    .from(file)
    .where(
      and(
        eq(file.folderId, folderId),
        eq(file.userId, userId),
        eq(file.isDeleted, false),
      ),
    )
    .limit(100)

  const childFileIds = childFiles.map((f) => f.id)

  if (childFolderIds.length > 0 || childFileIds.length > 0) {
    try {
      const trashDO = await getTrashDeletionDO(env)
      await trashDO.enqueueChildrenForFolder(
        folderId,
        childFileIds,
        childFolderIds,
      )
    } catch (err) {
      console.error('[Deletion] Failed to track folder children in DO:', err)
    }
  }

  return { fileIds: childFileIds, folderIds: childFolderIds }
}

export async function enqueueFolderChildren(
  queue: QueueClient,
  userId: string,
  folderId: string,
  childFileIds: string[],
  childFolderIds: string[],
): Promise<number> {
  let enqueued = 0
  const now = new Date()

  for (const fileId of childFileIds) {
    const result = await db
      .update(file)
      .set({ deletionQueuedAt: now })
      .where(
        and(
          eq(file.id, fileId),
          eq(file.userId, userId),
          eq(file.isDeleted, false),
        ),
      )

    if (result.changes && result.changes > 0) {
      await queue.send({ userId, itemId: fileId, itemType: 'file' })
      enqueued++
    }
  }

  for (const childFolderId of childFolderIds) {
    const result = await db
      .update(folder)
      .set({ deletionQueuedAt: now })
      .where(
        and(
          eq(folder.id, childFolderId),
          eq(folder.userId, userId),
          eq(folder.isDeleted, false),
        ),
      )

    if (result.changes && result.changes > 0) {
      await queue.send({ userId, itemId: childFolderId, itemType: 'folder' })
      enqueued++
    }
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
      folderId,
      fileIds,
      folderIds,
    )
    console.log(
      `[Deletion] Folder ${folderId}: enqueued ${enqueuedCount} children (${fileIds.length} files, ${folderIds.length} subfolders)`,
    )

    try {
      const trashDO = await getTrashDeletionDO(env)
      await trashDO.markChildProcessed(null, folderId)
    } catch (err) {
      console.error('[Deletion] Failed to mark folder as processed:', err)
    }

    return
  }

  console.log(`[Deletion] Folder ${folderId} is empty, deleting permanently`)

  await db.delete(folder).where(eq(folder.id, folderId))
  await deleteNodeByEntity(userId, 'folder', folderId)

  try {
    const trashDO = await getTrashDeletionDO(env)
    await trashDO.clearFolderState(folderId)
  } catch (err) {
    console.error('[Deletion] Failed to clear folder state:', err)
  }

  await invalidateFolderCache(userId, null)
  await invalidateQuotaCache(userId)
}

export async function checkAndDeleteCompletedFolders(
  env: Env,
  queue: QueueClient,
): Promise<number> {
  let deleted = 0

  try {
    const trashDO = await getTrashDeletionDO(env)
    const completedFolders = await trashDO.getPendingFolderCompletions()

    for (const folderId of completedFolders) {
      const folderRows = await db
        .select({ userId: folder.userId })
        .from(folder)
        .where(eq(folder.id, folderId))
        .limit(1)

      if (folderRows.length === 0) {
        await trashDO.clearFolderState(folderId)
        continue
      }

      const { userId } = folderRows[0]

      await db.delete(folder).where(eq(folder.id, folderId))
      await deleteNodeByEntity(userId, 'folder', folderId)

      await trashDO.clearFolderState(folderId)

      await invalidateFolderCache(userId, null)
      await invalidateQuotaCache(userId)

      deleted++
      console.log(
        `[Deletion] Folder ${folderId} deleted (all children processed)`,
      )
    }
  } catch (err) {
    console.error('[Deletion] Error checking completed folders:', err)
  }

  return deleted
}

export async function processDeletionBatch(
  items: TrashDeletionItem[],
  env: Env,
  queue: QueueClient,
): Promise<{ processed: number; errors: string[] }> {
  let processed = 0
  const errors: string[] = []

  for (const item of items) {
    try {
      if (item.itemType === 'file') {
        await deleteFile(item)
      } else {
        await deleteFolder(env, item, queue)
      }
      processed++
    } catch (err) {
      const msg = `Failed to delete ${item.itemType} ${item.itemId}: ${err}`
      console.error(msg)
      errors.push(msg)
    }
  }

  const folderDeletions = await checkAndDeleteCompletedFolders(env, queue)
  if (folderDeletions > 0) {
    console.log(
      `[Deletion] Completed ${folderDeletions} pending folder deletions`,
    )
  }

  return { processed, errors }
}
