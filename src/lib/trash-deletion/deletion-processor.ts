import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { file, userStorage } from '@/db/schema/storage'
import { getProviderClientById } from '@/lib/s3-provider-client'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { deleteNodeByEntity } from '@/lib/storage-btree/index'
import {
  invalidateFolderCache,
  invalidateQuotaCache,
} from '@/lib/cache-invalidation'
import type { TrashDeletionItem } from './params'
import { getTrashDeletionDO } from './do-client'
import { checkAndDeleteCompletedFolders, deleteFolder } from './folder-deletion'
import type { QueueClient } from './do-client'

export async function deleteFile(
  env: Env,
  item: TrashDeletionItem,
): Promise<void> {
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

  console.log('[Deletion] Attempting S3 delete:', {
    fileId,
    providerId: fileRow.providerId,
    objectKey: fileRow.objectKey,
  })

  if (fileRow.providerId && fileRow.objectKey) {
    try {
      const provider = await getProviderClientById(fileRow.providerId)
      console.log('[Deletion] Provider client retrieved:', provider.providerId)
      await provider.client.send(
        new DeleteObjectCommand({
          Bucket: provider.bucketName,
          Key: fileRow.objectKey,
        }),
      )
      console.log('[Deletion] S3 delete successful')
    } catch (err) {
      console.error(`[Deletion] S3 delete failed for file ${fileId}:`, err)
      throw new Error(
        `Failed to delete file object from provider before DB cleanup: ${fileId}`,
      )
    }
  } else {
    console.log(
      '[Deletion] Skipping S3 delete: missing providerId or objectKey',
    )
  }

  await db.delete(file).where(eq(file.id, fileId))
  await deleteNodeByEntity(userId, 'file', fileId)

  // Update user storage quota
  if (fileRow.sizeInBytes && fileRow.sizeInBytes > 0) {
    const storageRow = await db
      .select({ usedStorage: userStorage.usedStorage })
      .from(userStorage)
      .where(eq(userStorage.userId, userId))
      .limit(1)

    if (storageRow.length > 0) {
      const newUsed = Math.max(
        0,
        storageRow[0].usedStorage - fileRow.sizeInBytes,
      )
      await db
        .update(userStorage)
        .set({ usedStorage: newUsed })
        .where(eq(userStorage.userId, userId))
    }
  }

  try {
    const trashDO = await getTrashDeletionDO(env)
    await trashDO.markChildProcessed(fileRow.folderId, fileId)
  } catch (error) {
    console.error('[Deletion] Failed to mark file as processed:', error)
  }

  await invalidateQuotaCache(userId)
  await invalidateFolderCache(userId, fileRow.folderId)
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
        await deleteFile(env, item)
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

  const folderDeletions = await checkAndDeleteCompletedFolders(env)
  if (folderDeletions > 0) {
    console.log(
      `[Deletion] Completed ${folderDeletions} pending folder deletions`,
    )
  }

  return { processed, errors }
}
