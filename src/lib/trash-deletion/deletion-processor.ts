import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { file, userStorage } from '@/db/schema/storage'
import { fileVersion } from '@/db/schema/s3-controls'
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

export async function deleteFile(
  env: Env,
  item: TrashDeletionItem,
): Promise<void> {
  const { itemId: fileId, userId } = item

  console.log('[Workflow Step] deleteFile started for:', fileId)

  const fileRows = await db
    .select({
      objectKey: file.objectKey,
      sizeInBytes: file.sizeInBytes,
      providerId: file.providerId,
      folderId: file.folderId,
      isDeleted: file.isDeleted,
    })
    .from(file)
    .where(and(eq(file.id, fileId), eq(file.userId, userId)))
    .limit(1)

  if (fileRows.length === 0) {
    console.log('[Workflow Step] deleteFile: file not found, skipping:', fileId)
    return
  }

  const fileRow = fileRows[0]

  // Skip if item is no longer marked for deletion (e.g., restored)
  if (!fileRow.isDeleted) {
    console.log(
      `[Workflow Step] Skipping file ${fileId}: not marked for deletion (restored?)`,
    )
    // Still mark as processed for parent folder tracking
    try {
      const trashDO = await getTrashDeletionDO(env)
      await trashDO.markChildProcessed(fileRow.folderId, fileId)
    } catch (error) {
      console.error(
        '[Workflow Step] Failed to mark restored file as processed:',
        error,
      )
    }
    return
  }

  console.log('[Workflow Step] Attempting S3 delete for file:', {
    fileId,
    providerId: fileRow.providerId,
    objectKey: fileRow.objectKey,
    sizeInBytes: fileRow.sizeInBytes,
  })

  let attemptedDelete = false
  if (fileRow.objectKey && fileRow.objectKey.trim() !== '') {
    attemptedDelete = true
    try {
      const provider = await getProviderClientById(fileRow.providerId)
      console.log('[Workflow Step] S3 delete:', {
        provider: provider.providerId,
        bucket: provider.bucketName,
        key: fileRow.objectKey,
      })
      await provider.client.send(
        new DeleteObjectCommand({
          Bucket: provider.bucketName,
          Key: fileRow.objectKey,
        }),
      )
      console.log('[Workflow Step] S3 delete successful:', fileRow.objectKey)
    } catch (err) {
      console.error(`[Workflow Step] S3 delete FAILED for file ${fileId}:`, err)
      throw new Error(
        `Failed to delete file object from provider before DB cleanup: ${fileId}`,
      )
    }
  }

  // Fallback: try file_version table
  if (!attemptedDelete) {
    try {
      const versionRows = await db
        .select({
          objectKey: fileVersion.objectKey,
          upstreamObjectKey: fileVersion.upstreamObjectKey,
          storageProviderId: fileVersion.storageProviderId,
        })
        .from(fileVersion)
        .where(eq(fileVersion.fileId, fileId))

      if (versionRows.length === 0) {
        console.log(
          '[Workflow Step] No alternate keys found for file, skipping S3 delete',
        )
      } else {
        for (const vr of versionRows) {
          const keysToTry: string[] = []
          if (vr.upstreamObjectKey) keysToTry.push(vr.upstreamObjectKey)
          if (vr.objectKey) keysToTry.push(vr.objectKey)

          for (const key of keysToTry) {
            try {
              const provider = await getProviderClientById(
                vr.storageProviderId ?? fileRow.providerId,
              )
              console.log(
                '[Workflow Step] Attempting fallback S3 delete for key:',
                key,
              )
              await provider.client.send(
                new DeleteObjectCommand({
                  Bucket: provider.bucketName,
                  Key: key,
                }),
              )
              console.log(
                '[Workflow Step] Fallback S3 delete successful for key:',
                key,
              )
            } catch (err) {
              console.warn(
                '[Workflow Step] Fallback S3 delete failed for key:',
                key,
                err,
              )
            }
          }
        }
      }
    } catch (err) {
      console.error(
        '[Workflow Step] Error while attempting fallback key deletion:',
        err,
      )
    }
  }

  console.log('[Workflow Step] Deleting file from DB:', fileId)
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
      console.log('[Workflow Step] Quota updated:', {
        userId,
        oldUsed: storageRow[0].usedStorage,
        newUsed,
      })
    }
  }

  try {
    const trashDO = await getTrashDeletionDO(env)
    await trashDO.markChildProcessed(fileRow.folderId, fileId)
    console.log('[Workflow Step] Marked child as processed:', fileId)
  } catch (error) {
    console.error('[Workflow Step] Failed to mark file as processed:', error)
  }

  await invalidateQuotaCache(userId)
  await invalidateFolderCache(userId, fileRow.folderId)

  console.log('[Workflow Step] deleteFile completed for:', fileId)
}

export async function processDeletionBatch(
  items: TrashDeletionItem[],
  env: Env,
): Promise<void> {
  for (const item of items) {
    if (item.itemType === 'file') {
      await deleteFile(env, item)
    } else {
      await deleteFolder(env, item)
    }
  }

  const folderDeletions = await checkAndDeleteCompletedFolders(env)
  if (folderDeletions > 0) {
    console.log(
      `[Deletion] Completed ${folderDeletions} pending folder deletions`,
    )
  }
}
