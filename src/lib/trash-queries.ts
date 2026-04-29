import { eq, and, desc } from 'drizzle-orm'

export type TrashItem = {
  id: string
  name: string
  type: 'file' | 'folder'
  deletedAt: string | null
  sizeInBytes?: number
  mimeType?: string | null
  folderId?: string | null // for files: parent folder ID
  parentFolderId?: string | null // for folders: parent folder ID
}

export async function listTrashItems(
  userId: string,
  options?: { limit?: number; offset?: number },
): Promise<TrashItem[]> {
  const [{ db }, { file: storageFile, folder }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  const limit = options?.limit ?? 100
  const offset = options?.offset ?? 0

  const [trashedFiles, trashedFolders] = await Promise.all([
    db
      .select({
        id: storageFile.id,
        name: storageFile.name,
        deletedAt: storageFile.deletedAt,
        sizeInBytes: storageFile.sizeInBytes,
        mimeType: storageFile.mimeType,
      })
      .from(storageFile)
      .where(
        and(
          eq(storageFile.userId, userId),
          eq(storageFile.isTrashed, true),
          eq(storageFile.isDeleted, false),
        ),
      )
      .orderBy(desc(storageFile.deletedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({
        id: folder.id,
        name: folder.name,
        deletedAt: folder.deletedAt,
      })
      .from(folder)
      .where(
        and(
          eq(folder.userId, userId),
          eq(folder.isTrashed, true),
          eq(folder.isDeleted, false),
        ),
      )
      .orderBy(desc(folder.deletedAt))
      .limit(limit)
      .offset(offset),
  ])

  const items: TrashItem[] = [
    ...trashedFolders.map((f) => ({
      id: f.id,
      name: f.name,
      type: 'folder' as const,
      deletedAt: f.deletedAt?.toISOString() ?? null,
    })),
    ...trashedFiles.map((f) => ({
      id: f.id,
      name: f.name,
      type: 'file' as const,
      deletedAt: f.deletedAt?.toISOString() ?? null,
      sizeInBytes: f.sizeInBytes,
      mimeType: f.mimeType,
    })),
  ]

  // Already sorted by DB; combine and re-sort (folders+files interleaved by deletedAt)
  items.sort((a, b) => {
    const da = a.deletedAt ? new Date(a.deletedAt).getTime() : 0
    const db2 = b.deletedAt ? new Date(b.deletedAt).getTime() : 0
    return db2 - da
  })

  return items
}

export async function listTrashFolderContents(
  userId: string,
  parentFolderId: string | null = null,
): Promise<TrashItem[]> {
  const [{ db }, { file: storageFile, folder }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  // Fetch all trashed folders
  const allTrashedFolders = await db
    .select({
      id: folder.id,
      name: folder.name,
      deletedAt: folder.deletedAt,
      parentFolderId: folder.parentFolderId,
    })
    .from(folder)
    .where(
      and(
        eq(folder.userId, userId),
        eq(folder.isTrashed, true),
        eq(folder.isDeleted, false),
      ),
    )
    .orderBy(desc(folder.deletedAt))

  // Fetch all trashed files
  const allTrashedFiles = await db
    .select({
      id: storageFile.id,
      name: storageFile.name,
      deletedAt: storageFile.deletedAt,
      sizeInBytes: storageFile.sizeInBytes,
      mimeType: storageFile.mimeType,
      folderId: storageFile.folderId,
    })
    .from(storageFile)
    .where(
      and(
        eq(storageFile.userId, userId),
        eq(storageFile.isTrashed, true),
        eq(storageFile.isDeleted, false),
      ),
    )
    .orderBy(desc(storageFile.deletedAt))

  const trashedFolderIds = new Set(allTrashedFolders.map((f) => f.id))

  // Folders: those with parentFolderId === parentFolderId
  const folders = allTrashedFolders.filter(
    (f) => f.parentFolderId === parentFolderId,
  )

  // Files: depends on context
  let files = allTrashedFiles
  if (parentFolderId === null) {
    files = allTrashedFiles.filter(
      (f) => f.folderId === null || !trashedFolderIds.has(f.folderId),
    )
  } else {
    files = allTrashedFiles.filter((f) => f.folderId === parentFolderId)
  }

  const items: TrashItem[] = [
    ...folders.map((f) => ({
      id: f.id,
      name: f.name,
      type: 'folder' as const,
      deletedAt: f.deletedAt?.toISOString() ?? null,
      parentFolderId: f.parentFolderId,
    })),
    ...files.map((f) => ({
      id: f.id,
      name: f.name,
      type: 'file' as const,
      deletedAt: f.deletedAt?.toISOString() ?? null,
      sizeInBytes: f.sizeInBytes,
      mimeType: f.mimeType,
      folderId: f.folderId,
    })),
  ]

  // Sort by deletedAt descending
  items.sort((a, b) => {
    const da = a.deletedAt ? new Date(a.deletedAt).getTime() : 0
    const db_ = b.deletedAt ? new Date(b.deletedAt).getTime() : 0
    return db_ - da
  })

  return items
}
