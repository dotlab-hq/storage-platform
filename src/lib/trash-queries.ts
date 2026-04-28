import { eq, and } from 'drizzle-orm'

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

export async function listTrashItems(userId: string): Promise<TrashItem[]> {
  const [{ db }, { file: storageFile, folder }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  const [deletedFiles, deletedFolders] = await Promise.all([
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
        and(eq(storageFile.userId, userId), eq(storageFile.isTrashed, true)),
      ),
    db
      .select({
        id: folder.id,
        name: folder.name,
        deletedAt: folder.deletedAt,
      })
      .from(folder)
      .where(and(eq(folder.userId, userId), eq(folder.isTrashed, true))),
  ])

  const items: TrashItem[] = [
    ...deletedFolders.map((f) => ({
      id: f.id,
      name: f.name,
      type: 'folder' as const,
      deletedAt: f.deletedAt?.toISOString() ?? null,
    })),
    ...deletedFiles.map((f) => ({
      id: f.id,
      name: f.name,
      type: 'file' as const,
      deletedAt: f.deletedAt?.toISOString() ?? null,
      sizeInBytes: f.sizeInBytes,
      mimeType: f.mimeType,
    })),
  ]

  // Sort by deletedAt descending (most recently deleted first)
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

  // Fetch all deleted folders
  const allDeletedFolders = await db
    .select({
      id: folder.id,
      name: folder.name,
      deletedAt: folder.deletedAt,
      parentFolderId: folder.parentFolderId,
    })
    .from(folder)
    .where(and(eq(folder.userId, userId), eq(folder.isTrashed, true)))

  // Fetch all deleted files
  const allDeletedFiles = await db
    .select({
      id: storageFile.id,
      name: storageFile.name,
      deletedAt: storageFile.deletedAt,
      sizeInBytes: storageFile.sizeInBytes,
      mimeType: storageFile.mimeType,
      folderId: storageFile.folderId,
    })
    .from(storageFile)
    .where(and(eq(storageFile.userId, userId), eq(storageFile.isTrashed, true)))

  const deletedFolderIds = new Set(allDeletedFolders.map((f) => f.id))

  // Folders: those with parentFolderId === parentFolderId
  const folders = allDeletedFolders.filter(
    (f) => f.parentFolderId === parentFolderId,
  )

  // Files: depends on context
  let files = allDeletedFiles
  if (parentFolderId === null) {
    files = allDeletedFiles.filter(
      (f) => f.folderId === null || !deletedFolderIds.has(f.folderId),
    )
  } else {
    files = allDeletedFiles.filter((f) => f.folderId === parentFolderId)
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
