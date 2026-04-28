import { eq, and, inArray } from 'drizzle-orm'
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
          isDeleted: true,
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
          isDeleted: true,
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
        .set({
          isTrashed: false,
          isDeleted: true,
          deletedAt: now,
          deletionQueuedAt: null,
        })
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
        .set({
          isTrashed: false,
          isDeleted: true,
          deletedAt: now,
          deletionQueuedAt: null,
        })
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
