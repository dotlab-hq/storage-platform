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

  // At the trash root, show every trashed item whose parent is *not* itself
  // in the trash (its parent may be a live folder or the drive root).
  // Inside a trashed folder, show its direct children.
  const isVisibleHere = (parentId: string | null) =>
    parentFolderId === null
      ? parentId === null || !trashedFolderIds.has(parentId)
      : parentId === parentFolderId

  const folders = allTrashedFolders.filter((f) =>
    isVisibleHere(f.parentFolderId),
  )

  const files = allTrashedFiles.filter((f) => isVisibleHere(f.folderId))

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
