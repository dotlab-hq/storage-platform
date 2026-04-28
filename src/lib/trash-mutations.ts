import { eq, and, inArray } from 'drizzle-orm'
import { seedNodeById } from '@/lib/storage-btree/seed'
import {
  enqueueTrashDeletionItems,
  markItemsDeleted,
} from '@/lib/trash-deletion/producer'
import { getTrashDeletionQueueFromRequestContext } from '@/lib/trash-deletion/request-context'

export async function restoreItems(
  userId: string,
  itemIds: string[],
  itemTypes: ('file' | 'folder')[],
) {
  const [{ db }, { file: storageFile, folder }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  const fileIds: string[] = []
  const folderIds: string[] = []
  for (let i = 0; i < itemIds.length; i++) {
    if (itemTypes[i] === 'file') fileIds.push(itemIds[i])
    else folderIds.push(itemIds[i])
  }

  const CHUNK_SIZE = 500

  // Restore files (only the explicitly selected files)
  if (fileIds.length > 0) {
    for (let i = 0; i < fileIds.length; i += CHUNK_SIZE) {
      const chunk = fileIds.slice(i, i + CHUNK_SIZE)
      await db
        .update(storageFile)
        .set({
          isDeleted: false,
          isTrashed: false,
          deletedAt: null,
          deletionQueuedAt: null,
        })
        .where(
          and(eq(storageFile.userId, userId), inArray(storageFile.id, chunk)),
        )
    }
  }

  // Restore folders (only the explicitly selected folders)
  if (folderIds.length > 0) {
    for (let i = 0; i < folderIds.length; i += CHUNK_SIZE) {
      const chunk = folderIds.slice(i, i + CHUNK_SIZE)
      await db
        .update(folder)
        .set({
          isDeleted: false,
          isTrashed: false,
          deletedAt: null,
          deletionQueuedAt: null,
        })
        .where(and(eq(folder.userId, userId), inArray(folder.id, chunk)))
    }
  }

  // Seed btree nodes for restored items (will sync isDeleted flag based on isTrashed/isDeleted)
  await Promise.all([
    ...fileIds.map((id) => seedNodeById(userId, 'file', id)),
    ...folderIds.map((id) => seedNodeById(userId, 'folder', id)),
  ])

  const { invalidateFolderCache, invalidateQuotaCache } =
    await import('@/lib/cache-invalidation')
  await invalidateQuotaCache(userId)
  await invalidateFolderCache(userId, null)

  return { restored: itemIds.length }
}

export async function permanentDeleteItems(
  userId: string,
  itemIds: string[],
  itemTypes: ('file' | 'folder')[],
) {
  const fileIds: string[] = []
  const folderIds: string[] = []
  for (let i = 0; i < itemIds.length; i++) {
    if (itemTypes[i] === 'file') fileIds.push(itemIds[i])
    else folderIds.push(itemIds[i])
  }

  const items = [
    ...fileIds.map((id) => ({ userId, itemId: id, itemType: 'file' as const })),
    ...folderIds.map((id) => ({ userId, itemId: id, itemType: 'folder' as const })),
  ]
  await markItemsDeleted(userId, items)
  const queue = getTrashDeletionQueueFromRequestContext()
  await enqueueTrashDeletionItems(queue, items)

  const { invalidateFolderCache, invalidateQuotaCache } =
    await import('@/lib/cache-invalidation')
  await invalidateQuotaCache(userId)
  await invalidateFolderCache(userId, null)

  return {
    deletedFiles: fileIds.length,
    deletedFolders: folderIds.length,
  }
}

export async function restoreAllTrash(userId: string) {
  const [{ db }, { file: storageFile, folder }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  // Fetch all deleted file IDs and folder IDs
  const [fileRows, folderRows] = await Promise.all([
    db
      .select({ id: storageFile.id })
      .from(storageFile)
      .where(
        and(eq(storageFile.userId, userId), eq(storageFile.isDeleted, true)),
      ),
    db
      .select({ id: folder.id })
      .from(folder)
      .where(and(eq(folder.userId, userId), eq(folder.isDeleted, true))),
  ])

  const itemIds = [...fileRows.map((r) => r.id), ...folderRows.map((r) => r.id)]
  const itemTypes = [
    ...fileRows.map(() => 'file' as const),
    ...folderRows.map(() => 'folder' as const),
  ]

  return restoreItems(userId, itemIds, itemTypes)
}

export async function emptyAllTrash(userId: string) {
  const [{ db }, { file: storageFile, folder }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  // Fetch all deleted file IDs and folder IDs in two queries
  const [fileRows, folderRows] = await Promise.all([
    db
      .select({ id: storageFile.id })
      .from(storageFile)
      .where(
        and(eq(storageFile.userId, userId), eq(storageFile.isDeleted, true)),
      ),
    db
      .select({ id: folder.id })
      .from(folder)
      .where(and(eq(folder.userId, userId), eq(folder.isDeleted, true))),
  ])

  const fileIds = fileRows.map((r) => r.id)
  const folderIds = folderRows.map((r) => r.id)

  const items = [
    ...fileIds.map((id) => ({ userId, itemId: id, itemType: 'file' as const })),
    ...folderIds.map((id) => ({ userId, itemId: id, itemType: 'folder' as const })),
  ]
  await markItemsDeleted(userId, items)
  const queue = getTrashDeletionQueueFromRequestContext()
  await enqueueTrashDeletionItems(queue, items)

  const { invalidateFolderCache, invalidateQuotaCache } =
    await import('@/lib/cache-invalidation')
  await invalidateQuotaCache(userId)
  await invalidateFolderCache(userId, null)

  return {
    deletedFiles: fileIds.length,
    deletedFolders: folderIds.length,
  }
}
