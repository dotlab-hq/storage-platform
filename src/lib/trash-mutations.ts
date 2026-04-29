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

  // Restore folders first (so children can check updated parent state)
  if (folderIds.length > 0) {
    for (let i = 0; i < folderIds.length; i += CHUNK_SIZE) {
      const chunk = folderIds.slice(i, i + CHUNK_SIZE)

      // Fetch folders to get parent folder info
      const folders = await db
        .select({
          id: folder.id,
          parentFolderId: folder.parentFolderId,
        })
        .from(folder)
        .where(and(eq(folder.userId, userId), inArray(folder.id, chunk)))

      // Collect non-null parent folder IDs
      const parentFolderIds = [
        ...new Set(
          folders
            .map((f) => f.parentFolderId)
            .filter((id): id is string => id != null),
        ),
      ]

      // Determine which parent folders are deleted
      const deletedParentIds = new Set<string>()
      if (parentFolderIds.length > 0) {
        const parentFolders = await db
          .select({
            id: folder.id,
            isDeleted: folder.isDeleted,
          })
          .from(folder)
          .where(
            and(eq(folder.userId, userId), inArray(folder.id, parentFolderIds)),
          )
        for (const p of parentFolders) {
          if (p.isDeleted) deletedParentIds.add(p.id)
        }
      }

      // Restore all folders: clear trash and deleted flags
      await db
        .update(folder)
        .set({ isTrashed: false, isDeleted: false })
        .where(and(eq(folder.userId, userId), inArray(folder.id, chunk)))

      // Orphan folders whose parent folder is deleted
      const orphanedIds = folders
        .filter(
          (f) => f.parentFolderId && deletedParentIds.has(f.parentFolderId),
        )
        .map((f) => f.id)

      if (orphanedIds.length > 0) {
        await db
          .update(folder)
          .set({ parentFolderId: null })
          .where(
            and(eq(folder.userId, userId), inArray(folder.id, orphanedIds)),
          )
      }
    }
  }

  // Restore folders first (so children can check updated parent state)
  if (folderIds.length > 0) {
    for (let i = 0; i < folderIds.length; i += CHUNK_SIZE) {
      const chunk = folderIds.slice(i, i + CHUNK_SIZE)

      // Fetch folders to get parent folder info
      const folders = await db
        .select({
          id: folder.id,
          parentFolderId: folder.parentFolderId,
        })
        .from(folder)
        .where(and(eq(folder.userId, userId), inArray(folder.id, chunk)))

      // Collect non-null parent folder IDs
      const parentFolderIds = [
        ...new Set(
          folders
            .map((f) => f.parentFolderId)
            .filter((id): id is string => id != null),
        ),
      ]

      // Determine which parent folders are unavailable (trashed or deleted)
      const unavailableParentIds = new Set<string>()
      if (parentFolderIds.length > 0) {
        const parentFolders = await db
          .select({
            id: folder.id,
            isTrashed: folder.isTrashed,
            isDeleted: folder.isDeleted,
          })
          .from(folder)
          .where(
            and(eq(folder.userId, userId), inArray(folder.id, parentFolderIds)),
          )
        for (const p of parentFolders) {
          if (p.isTrashed || p.isDeleted) unavailableParentIds.add(p.id)
        }
      }

      // Restore all folders: clear trash and deleted flags
      await db
        .update(folder)
        .set({ isTrashed: false, isDeleted: false })
        .where(and(eq(folder.userId, userId), inArray(folder.id, chunk)))

      // Orphan folders whose parent folder is unavailable
      const orphanedIds = folders
        .filter(
          (f) => f.parentFolderId && unavailableParentIds.has(f.parentFolderId),
        )
        .map((f) => f.id)

      if (orphanedIds.length > 0) {
        await db
          .update(folder)
          .set({ parentFolderId: null })
          .where(
            and(eq(folder.userId, userId), inArray(folder.id, orphanedIds)),
          )
      }
    }
  }

  // Restore files (only the explicitly selected files)
  if (fileIds.length > 0) {
    for (let i = 0; i < fileIds.length; i += CHUNK_SIZE) {
      const chunk = fileIds.slice(i, i + CHUNK_SIZE)

      // Fetch files to get parent folder info
      const files = await db
        .select({
          id: storageFile.id,
          folderId: storageFile.folderId,
        })
        .from(storageFile)
        .where(
          and(eq(storageFile.userId, userId), inArray(storageFile.id, chunk)),
        )

      // Collect non-null parent folder IDs
      const parentFolderIds = [
        ...new Set(
          files.map((f) => f.folderId).filter((id): id is string => id != null),
        ),
      ]

      // Determine which parent folders are unavailable (trashed or deleted)
      const unavailableParentIds = new Set<string>()
      if (parentFolderIds.length > 0) {
        const parentFolders = await db
          .select({
            id: folder.id,
            isTrashed: folder.isTrashed,
            isDeleted: folder.isDeleted,
          })
          .from(folder)
          .where(
            and(eq(folder.userId, userId), inArray(folder.id, parentFolderIds)),
          )
        for (const p of parentFolders) {
          if (p.isTrashed || p.isDeleted) unavailableParentIds.add(p.id)
        }
      }

      // Restore all files: clear trash and deleted flags
      await db
        .update(storageFile)
        .set({ isTrashed: false, isDeleted: false })
        .where(
          and(eq(storageFile.userId, userId), inArray(storageFile.id, chunk)),
        )

      // Orphan files whose parent folder is unavailable
      const orphanedIds = files
        .filter((f) => f.folderId && unavailableParentIds.has(f.folderId))
        .map((f) => f.id)

      if (orphanedIds.length > 0) {
        await db
          .update(storageFile)
          .set({ folderId: null })
          .where(
            and(
              eq(storageFile.userId, userId),
              inArray(storageFile.id, orphanedIds),
            ),
          )
      }
    }
  }
      }

      // Restore all files: clear trash and deleted flags
      await db
        .update(storageFile)
        .set({ isTrashed: false, isDeleted: false })
        .where(
          and(eq(storageFile.userId, userId), inArray(storageFile.id, chunk)),
        )

      // Orphan files whose parent folder is deleted
      const orphanedIds = files
        .filter((f) => f.folderId && deletedParentIds.has(f.folderId))
        .map((f) => f.id)

      if (orphanedIds.length > 0) {
        await db
          .update(storageFile)
          .set({ folderId: null })
          .where(
            and(
              eq(storageFile.userId, userId),
              inArray(storageFile.id, orphanedIds),
            ),
          )
      }
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
    ...folderIds.map((id) => ({
      userId,
      itemId: id,
      itemType: 'folder' as const,
    })),
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

  // Fetch all trashed file IDs and folder IDs
  const [fileRows, folderRows] = await Promise.all([
    db
      .select({ id: storageFile.id })
      .from(storageFile)
      .where(
        and(
          eq(storageFile.userId, userId),
          eq(storageFile.isTrashed, true),
          eq(storageFile.isDeleted, false),
        ),
      ),
    db
      .select({ id: folder.id })
      .from(folder)
      .where(
        and(
          eq(folder.userId, userId),
          eq(folder.isTrashed, true),
          eq(folder.isDeleted, false),
        ),
      ),
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

  // Fetch all trashed file IDs and folder IDs in two queries
  const [fileRows, folderRows] = await Promise.all([
    db
      .select({ id: storageFile.id })
      .from(storageFile)
      .where(
        and(
          eq(storageFile.userId, userId),
          eq(storageFile.isTrashed, true),
          eq(storageFile.isDeleted, false),
        ),
      ),
    db
      .select({ id: folder.id })
      .from(folder)
      .where(
        and(
          eq(folder.userId, userId),
          eq(folder.isTrashed, true),
          eq(folder.isDeleted, false),
        ),
      ),
  ])

  const fileIds = fileRows.map((r) => r.id)
  const folderIds = folderRows.map((r) => r.id)

  const items = [
    ...fileIds.map((id) => ({ userId, itemId: id, itemType: 'file' as const })),
    ...folderIds.map((id) => ({
      userId,
      itemId: id,
      itemType: 'folder' as const,
    })),
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
