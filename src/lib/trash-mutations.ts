import { eq, and, inArray } from 'drizzle-orm'
import { getProviderClientById } from '@/lib/s3-provider-client'
import {
  deleteNodeByEntity,
  markFolderSubtreeDeleted,
} from '@/lib/storage-btree/index'
import { seedNodeById } from '@/lib/storage-btree/seed'
import { listTrashItems } from './trash-queries'

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

  // For folders, collect all descendant folder IDs to restore their files too
  const allFolderIdsToRestore = new Set(folderIds)
  if (folderIds.length > 0) {
    const visitedFolderIds = new Set(folderIds)
    let toProcess: string[] = [...folderIds]
    let depth = 0

    while (toProcess.length > 0) {
      const children = await db
        .select({ id: folder.id })
        .from(folder)
        .where(
          and(
            eq(folder.userId, userId),
            eq(folder.isDeleted, true),
            inArray(folder.parentFolderId, toProcess),
          ),
        )
      const childIds = children
        .map((c) => c.id)
        .filter((childId) => {
          if (visitedFolderIds.has(childId)) {
            return false
          }
          visitedFolderIds.add(childId)
          return true
        })

      if (childIds.length === 0) {
        break
      }

      childIds.forEach((id) => allFolderIdsToRestore.add(id))
      toProcess = childIds
      depth += 1

      if (depth > 1024) {
        throw new Error('Folder restore traversal exceeded safe depth')
      }
    }
  }

  await Promise.all([
    ...fileIds.map((id) =>
      db
        .update(storageFile)
        .set({ isDeleted: false, deletedAt: null })
        .where(and(eq(storageFile.id, id), eq(storageFile.userId, userId))),
    ),
    ...folderIds.map((id) =>
      db
        .update(folder)
        .set({ isDeleted: false, deletedAt: null })
        .where(and(eq(folder.id, id), eq(folder.userId, userId))),
    ),
  ])

  // Restore all descendant files of the restored folders
  if (allFolderIdsToRestore.size > 0) {
    await db
      .update(storageFile)
      .set({ isDeleted: false, deletedAt: null })
      .where(
        and(
          inArray(storageFile.folderId, Array.from(allFolderIdsToRestore)),
          eq(storageFile.userId, userId),
        ),
      )
  }

  await Promise.all(fileIds.map((id) => seedNodeById(userId, 'file', id)))
  for (const id of folderIds) {
    await seedNodeById(userId, 'folder', id)
    await markFolderSubtreeDeleted(userId, id, false)
  }

  // Also seed the btree for all descendant files that were just restored
  const filesToSeed = await db
    .select({ id: storageFile.id })
    .from(storageFile)
    .where(
      and(
        inArray(storageFile.folderId, Array.from(allFolderIdsToRestore)),
        eq(storageFile.userId, userId),
      ),
    )
  await Promise.all(filesToSeed.map((f) => seedNodeById(userId, 'file', f.id)))

  const { invalidateFolderCache, invalidateQuotaCache } =
    await import('@/lib/cache-invalidation')
  await invalidateQuotaCache(userId)

  // Invalidate everything to be safe since things could be restored anywhere
  await invalidateFolderCache(userId, null)

  return { restored: itemIds.length }
}

export async function permanentDeleteItems(
  userId: string,
  itemIds: string[],
  itemTypes: ('file' | 'folder')[],
) {
  const [{ db }, { file: storageFile, folder, userStorage }] =
    await Promise.all([import('@/db'), import('@/db/schema/storage')])

  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')

  const fileIds: string[] = []
  const folderIds: string[] = []
  for (let i = 0; i < itemIds.length; i++) {
    if (itemTypes[i] === 'file') fileIds.push(itemIds[i])
    else folderIds.push(itemIds[i])
  }

  let freedBytes = 0

  // Delete files from S3 + DB
  for (const id of fileIds) {
    const fileRows = await db
      .select({
        objectKey: storageFile.objectKey,
        sizeInBytes: storageFile.sizeInBytes,
        providerId: storageFile.providerId,
      })
      .from(storageFile)
      .where(and(eq(storageFile.id, id), eq(storageFile.userId, userId)))
      .limit(1)
    if (fileRows.length === 0) {
      continue
    }
    const row = fileRows[0]

    try {
      const provider = await getProviderClientById(row.providerId ?? null)
      await provider.client.send(
        new DeleteObjectCommand({
          Bucket: provider.bucketName,
          Key: row.objectKey,
        }),
      )
    } catch (err) {
      console.error(`[Server] S3 delete failed for key=${row.objectKey}:`, err)
    }
    freedBytes += row.sizeInBytes
    await db
      .delete(storageFile)
      .where(and(eq(storageFile.id, id), eq(storageFile.userId, userId)))
    await deleteNodeByEntity(userId, 'file', id)
  }

  // Delete folders from DB
  for (const id of folderIds) {
    await db
      .delete(folder)
      .where(and(eq(folder.id, id), eq(folder.userId, userId)))
    await deleteNodeByEntity(userId, 'folder', id)
  }

  // Update used storage
  if (freedBytes > 0) {
    const currentStorageRows = await db
      .select({ usedStorage: userStorage.usedStorage })
      .from(userStorage)
      .where(eq(userStorage.userId, userId))
      .limit(1)

    if (currentStorageRows.length > 0) {
      const currentStorage = currentStorageRows[0]
      const newUsed = Math.max(0, currentStorage.usedStorage - freedBytes)
      await db
        .update(userStorage)
        .set({ usedStorage: newUsed })
        .where(eq(userStorage.userId, userId))
    }
  }

  const { invalidateFolderCache, invalidateQuotaCache } =
    await import('@/lib/cache-invalidation')
  await invalidateQuotaCache(userId)
  await invalidateFolderCache(userId, null)

  return {
    deletedFiles: fileIds.length,
    deletedFolders: folderIds.length,
    freedBytes,
  }
}

export async function restoreAllTrash(userId: string) {
  const allItems = await listTrashItems(userId)
  const itemIds = allItems.map((i) => i.id)
  const itemTypes = allItems.map((i) => i.type)
  return restoreItems(userId, itemIds, itemTypes)
}

export async function emptyAllTrash(userId: string) {
  const allItems = await listTrashItems(userId)
  const itemIds = allItems.map((i) => i.id)
  const itemTypes = allItems.map((i) => i.type)
  return permanentDeleteItems(userId, itemIds, itemTypes)
}
