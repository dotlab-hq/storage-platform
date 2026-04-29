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
    return
  }

  const fileRow = fileRows[0]

  // Skip if item is no longer marked for deletion (e.g., restored)
  if (!fileRow.isDeleted) {
    console.log(
      `[Deletion] Skipping file ${fileId}: not marked for deletion (restored?)`,
    )
    // Still mark as processed for parent folder tracking
    try {
      const trashDO = await getTrashDeletionDO(env)
      await trashDO.markChildProcessed(fileRow.folderId, fileId)
    } catch (error) {
      console.error(
        '[Deletion] Failed to mark restored file as processed:',
        error,
      )
    }
    return
  }

  console.log('[Deletion] Attempting S3 delete:', {
    fileId,
    providerId: fileRow.providerId,
    objectKey: fileRow.objectKey,
  })
  // Primary deletion target
  let attemptedDelete = false
  if (fileRow.objectKey && fileRow.objectKey.trim() !== '') {
    attemptedDelete = true
    try {
      const provider = await getProviderClientById(fileRow.providerId)
      console.log('[Deletion] Provider client retrieved:', provider.providerId)
      await provider.client.send(
        new DeleteObjectCommand({
          Bucket: provider.bucketName,
          Key: fileRow.objectKey,
        }),
      )
      console.log('[Deletion] S3 delete successful for key:', fileRow.objectKey)
    } catch (err) {
      console.error(`[Deletion] S3 delete failed for file ${fileId}:`, err)
      throw new Error(
        `Failed to delete file object from provider before DB cleanup: ${fileId}`,
      )
    }
  }

  // Fallback: if primary objectKey missing or empty, try file_version table
  // This handles cases where the committed file's key is stored in file_version
  // or other migration artifacts. We attempt best-effort deletes and log results.
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
          '[Deletion] No alternate keys found for file, skipping S3 delete',
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
                '[Deletion] Attempting fallback S3 delete for key:',
                key,
              )
              await provider.client.send(
                new DeleteObjectCommand({
                  Bucket: provider.bucketName,
                  Key: key,
                }),
              )
              console.log(
                '[Deletion] Fallback S3 delete successful for key:',
                key,
              )
            } catch (err) {
              console.warn(
                '[Deletion] Fallback S3 delete failed for key:',
                key,
                err,
              )
              // continue trying other keys; this is best-effort
            }
          }
        }
      }
    } catch (err) {
      console.error(
        '[Deletion] Error while attempting fallback key deletion:',
        err,
      )
      // don't throw here; proceed to DB cleanup if possible
    }
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
