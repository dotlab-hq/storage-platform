import { eq, and, inArray, desc, sql } from 'drizzle-orm'
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

/**
 * Permanent delete a single file from S3 and database.
 * Assumes the file record is locked by deletionQueuedAt.
 */
export async function deleteFile(item: TrashDeletionItem): Promise<void> {
  const { itemId: fileId, userId } = item

  // Fetch file metadata
  const fileRows = await db
    .select({
      objectKey: file.objectKey,
      sizeInBytes: file.sizeInBytes,
      providerId: file.providerId,
    })
    .from(file)
    .where(and(eq(file.id, fileId), eq(file.userId, userId)))
    .limit(1)

  if (fileRows.length === 0) {
    // Already deleted or not found, consider success
    return
  }

  const fileRow = fileRows[0]

  // Delete from S3
  try {
    const provider = await getProviderClientById(fileRow.providerId ?? null)
    await provider.client.send(
      new DeleteObjectCommand({
        Bucket: provider.bucketName,
        Key: fileRow.objectKey,
      }),
    )
  } catch (err) {
    console.error(`[Deletion] S3 delete failed for file ${fileId}:`, err)
    // Continue to delete from DB anyway (maybe file already gone)
  }

  // Delete from DB
  await db.delete(file).where(eq(file.id, fileId))

  // Delete B-tree node
  await deleteNodeByEntity(userId, 'file', fileId)

  // Adjust used storage
  if (fileRow.sizeInBytes && fileRow.sizeInBytes > 0) {
    await db
      .update('user_storage')
      .set({ usedStorage: sql`MAX(0, usedStorage - ${fileRow.sizeInBytes})` })
      .where(eq('user_storage.user_id', userId))
  }

  // Invalidate caches
  await invalidateQuotaCache(userId)
  // Invalidate parent folder caches - we can try to get parentId before deletion? Already lost. We'll invalidate global.
  await invalidateFolderCache(userId, null)
}

/**
 * Gather all descendant nodes (files and folders) of a folder.
 * Returns arrays of IDs for files and folders (excluding the root folder itself).
 */
export async function gatherFolderDescendants(
  userId: string,
  folderId: string,
): Promise<{ fileIds: string[]; folderIds: string[] }> {
  const allFolderIds: string[] = []
  const fileIds: string[] = []

  // Traverse folder tree BFS
  let toProcess: string[] = [folderId]
  let depth = 0

  while (toProcess.length > 0) {
    // Get child folders
    const children = await db
      .select({ id: folder.id })
      .from(folder)
      .where(
        and(
          eq(folder.userId, userId),
          inArray(folder.parentFolderId, toProcess),
        ),
      )

    const childIds = children.map((c) => c.id)
    if (childIds.length === 0) {
      break
    }

    allFolderIds.push(...childIds)
    toProcess = childIds
    depth += 1

    if (depth > 1024) {
      throw new Error('Descendant gathering exceeded safe depth')
    }
  }

  // Get all files in these folders (including direct children of the root folder)
  const folderIdsToQuery = [folderId, ...allFolderIds]
  const filesInFolders = await db
    .select({ id: file.id })
    .from(file)
    .where(
      and(
        eq(file.userId, userId),
        inArray(file.folderId, folderIdsToQuery),
        eq(file.isDeleted, true),
        eq(file.isTrashed, false),
      ),
    )

  for (const f of filesInFolders) {
    fileIds.push(f.id)
  }

  return { fileIds, folderIds: allFolderIds }
}

/**
 * Enqueue descendant items to the queue, marking them as claimed.
 */
export async function enqueueDescendants(
  queue: { send: (msg: TrashDeletionItem) => Promise<void> },
  userId: string,
  descendantFileIds: string[],
  descendantFolderIds: string[],
): Promise<number> {
  const now = new Date()
  let enqueued = 0

  // Enqueue files: claim and send
  for (const fileId of descendantFileIds) {
    const result = await db
      .update(file)
      .set({ deletionQueuedAt: now })
      .where(
        and(
          eq(file.id, fileId),
          eq(file.userId, userId),
          eq(file.isDeleted, true),
          eq(file.isTrashed, false),
          isNull(file.deletionQueuedAt),
        ),
      )

    if (result.changes && result.changes > 0) {
      await queue.send({ userId, itemId: fileId, itemType: 'file' })
      enqueued++
    }
  }

  // Enqueue folders: claim and send
  for (const folderId of descendantFolderIds) {
    const result = await db
      .update(folder)
      .set({ deletionQueuedAt: now })
      .where(
        and(
          eq(folder.id, folderId),
          eq(folder.userId, userId),
          eq(folder.isDeleted, true),
          eq(folder.isTrashed, false),
          isNull(folder.deletionQueuedAt),
        ),
      )

    if (result.changes && result.changes > 0) {
      await queue.send({ userId, itemId: folderId, itemType: 'folder' })
      enqueued++
    }
  }

  return enqueued
}

/**
 * Process deletion of a folder: enqueue all descendants and delete the folder itself.
 */
export async function deleteFolder(
  item: TrashDeletionItem,
  queue: { send: (msg: TrashDeletionItem) => Promise<void> },
): Promise<void> {
  const { userId, itemId: folderId } = item

  // Gather all descendants
  const { fileIds, folderIds } = await gatherFolderDescendants(userId, folderId)

  // Enqueue all descendant files and subfolders
  const enqueuedCount = await enqueueDescendants(
    queue,
    userId,
    fileIds,
    folderIds,
  )
  console.log(
    `[Deletion] Enqueued ${enqueuedCount} descendants for folder ${folderId}`,
  )

  // Now delete the folder itself (permanently)
  // First fetch its metadata? No need for S3 (folders don't exist in S3 directly; they are virtual)
  // Delete folder from DB
  await db
    .delete(folder)
    .where(and(eq(folder.id, folderId), eq(folder.userId, userId)))

  // Delete B-tree node for folder
  await deleteNodeByEntity(userId, 'folder', folderId)

  // For each descendant folder (that we enqueued), we are not deleting them here; they'll be processed later.
  // For descendant files that we enqueued, also not deleting here.

  // Invalidate caches broadly
  await invalidateFolderCache(userId, null)
  await invalidateQuotaCache(userId)
}

/**
 * Process a batch of deletion items in a workflow.
 */
export async function processDeletionBatch(
  items: TrashDeletionItem[],
  queue: { send: (msg: TrashDeletionItem) => Promise<void> },
): Promise<{ processed: number; errors: string[] }> {
  let processed = 0
  const errors: string[] = []

  for (const item of items) {
    try {
      if (item.itemType === 'file') {
        await deleteFile(item)
      } else {
        await deleteFolder(item, queue)
      }
      processed++
    } catch (err) {
      const msg = `Failed to delete ${item.itemType} ${item.itemId}: ${err}`
      console.error(msg)
      errors.push(msg)
    }
  }

  return { processed, errors }
}
