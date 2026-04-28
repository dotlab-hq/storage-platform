import { eq, and, inArray } from 'drizzle-orm'
import { markFolderSubtreeDeleted } from '@/lib/storage-btree/index'
import { seedNodeById } from '@/lib/storage-btree/seed'

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
    allFolderIdsToRestore.add(
      ...(await collectAllDescendantFolderIds(userId, folderIds)),
    )
  }

  const CHUNK_SIZE = 500

  // Restore files (including descendants of folders)
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

  // Restore folders
  if (folderIds.length > 0) {
    const allFolderArray = Array.from(allFolderIdsToRestore)
    for (let i = 0; i < allFolderArray.length; i += CHUNK_SIZE) {
      const chunk = allFolderArray.slice(i, i + CHUNK_SIZE)
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

  // Restore descendant files of all folders
  if (allFolderIdsToRestore.size > 0) {
    const descendantFileIds: string[] = []
    const allFolderArray = Array.from(allFolderIdsToRestore)
    for (let i = 0; i < allFolderArray.length; i += CHUNK_SIZE) {
      const folderChunk = allFolderArray.slice(i, i + CHUNK_SIZE)
      const fileRows = await db
        .select({ id: storageFile.id })
        .from(storageFile)
        .where(
          and(
            inArray(storageFile.folderId, folderChunk),
            eq(storageFile.userId, userId),
          ),
        )
      descendantFileIds.push(...fileRows.map((f) => f.id))
    }

    for (let i = 0; i < descendantFileIds.length; i += CHUNK_SIZE) {
      const chunk = descendantFileIds.slice(i, i + CHUNK_SIZE)
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

  // Seed btree nodes
  await Promise.all([
    ...fileIds.map((id) => seedNodeById(userId, 'file', id)),
    ...folderIds.map((id) => seedNodeById(userId, 'folder', id)),
  ])

  for (const folderId of folderIds) {
    await markFolderSubtreeDeleted(userId, folderId, false)
  }

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

  const now = new Date()
  const CHUNK_SIZE = 500

  // Mark files for deletion by queue - update only the flags, let cron handle actual deletion
  if (fileIds.length > 0) {
    for (let i = 0; i < fileIds.length; i += CHUNK_SIZE) {
      const chunk = fileIds.slice(i, i + CHUNK_SIZE)
      await db
        .update(storageFile)
        .set({
          isTrashed: false,
          deletedAt: now,
          deletionQueuedAt: null,
        })
        .where(
          and(
            inArray(storageFile.id, chunk),
            eq(storageFile.userId, userId),
            eq(storageFile.isTrashed, true),
          ),
        )
    }
  }

  // Mark folders for deletion by queue
  if (folderIds.length > 0) {
    for (let i = 0; i < folderIds.length; i += CHUNK_SIZE) {
      const chunk = folderIds.slice(i, i + CHUNK_SIZE)
      await db
        .update(folder)
        .set({
          isTrashed: false,
          deletedAt: now,
          deletionQueuedAt: null,
        })
        .where(
          and(
            inArray(folder.id, chunk),
            eq(folder.userId, userId),
            eq(folder.isTrashed, true),
          ),
        )
    }
  }

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
        and(eq(storageFile.userId, userId), eq(storageFile.isTrashed, true)),
      ),
    db
      .select({ id: folder.id })
      .from(folder)
      .where(and(eq(folder.userId, userId), eq(folder.isTrashed, true))),
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
        and(eq(storageFile.userId, userId), eq(storageFile.isTrashed, true)),
      ),
    db
      .select({ id: folder.id })
      .from(folder)
      .where(and(eq(folder.userId, userId), eq(folder.isTrashed, true))),
  ])

  const fileIds = fileRows.map((r) => r.id)
  const folderIds = folderRows.map((r) => r.id)

  const CHUNK_SIZE = 500
  const now = new Date()

  // Update files in chunks (parallel for speed)
  const fileChunks = []
  for (let i = 0; i < fileIds.length; i += CHUNK_SIZE) {
    fileChunks.push(fileIds.slice(i, i + CHUNK_SIZE))
  }
  await Promise.all(
    fileChunks.map((chunk) =>
      db
        .update(storageFile)
        .set({ isTrashed: false, deletedAt: now, deletionQueuedAt: null })
        .where(
          and(
            inArray(storageFile.id, chunk),
            eq(storageFile.userId, userId),
            eq(storageFile.isTrashed, true),
          ),
        ),
    ),
  )

  // Update folders in chunks (parallel for speed)
  const folderChunks = []
  for (let i = 0; i < folderIds.length; i += CHUNK_SIZE) {
    folderChunks.push(folderIds.slice(i, i + CHUNK_SIZE))
  }
  await Promise.all(
    folderChunks.map((chunk) =>
      db
        .update(folder)
        .set({ isTrashed: false, deletedAt: now, deletionQueuedAt: null })
        .where(
          and(
            inArray(folder.id, chunk),
            eq(folder.userId, userId),
            eq(folder.isTrashed, true),
          ),
        ),
    ),
  )

  const { invalidateFolderCache, invalidateQuotaCache } =
    await import('@/lib/cache-invalidation')
  await invalidateQuotaCache(userId)
  await invalidateFolderCache(userId, null)

  return {
    deletedFiles: fileIds.length,
    deletedFolders: folderIds.length,
  }
}

// Collect all descendant folder IDs for given root folder IDs using btree
async function collectAllDescendantFolderIds(
  userId: string,
  rootFolderIds: string[],
): Promise<string[]> {
  if (rootFolderIds.length === 0) return []

  const { db } = await import('@/db')
  const { storageNodeBtree } = await import('@/db/schema/storage-btree')
  const { eq, and, inArray, sql } = await import('drizzle-orm')

  const CHUNK_SIZE = 400 // Keep under 999 total params
  const descendantSet = new Set<string>()

  // Process root folder IDs in chunks to avoid exceeding parameter limit
  for (let i = 0; i < rootFolderIds.length; i += CHUNK_SIZE) {
    const chunk = rootFolderIds.slice(i, i + CHUNK_SIZE)

    // Use self-join on btree to get all descendant folder IDs in one query
    const parent = storageNodeBtree.as('parent')
    const child = storageNodeBtree.as('child')

    const rows = await db
      .select({ nodeId: child.nodeId })
      .from(parent)
      .innerJoin(
        child,
        sql`${child.fullPath} LIKE (${parent.fullPath} || '/%')`,
      )
      .where(
        and(
          eq(parent.userId, userId),
          eq(parent.nodeType, 'folder'),
          inArray(parent.nodeId, chunk),
          eq(child.userId, userId),
          eq(child.nodeType, 'folder'),
        ),
      )

    for (const r of rows) {
      descendantSet.add(r.nodeId)
    }
  }

  return Array.from(descendantSet)
}
