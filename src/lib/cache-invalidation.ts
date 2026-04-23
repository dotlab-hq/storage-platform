import { Cache } from '@/lib/Cache'

type CachedFolderItem = {
  id: string
  name: string
  createdAt: string
  parentFolderId: string | null
  isPrivatelyLocked?: boolean
}

type CachedFileItem = {
  id: string
  name: string
  sizeInBytes: number
  mimeType?: string | null
  objectKey?: string
  createdAt: string
  isPrivatelyLocked?: boolean
}

type FolderItemsCacheValue = {
  folders: CachedFolderItem[]
  files: CachedFileItem[]
  breadcrumbs: Array<{ id: string; name: string }>
}

type FolderCachePatch = {
  renameFolder?: { id: string; name: string }
  renameFile?: { id: string; name: string }
  removeFolderIds?: string[]
  removeFileIds?: string[]
}

function folderItemsCacheKeys(
  userId: string,
  folderId: string | null,
): string[] {
  const fId = folderId ?? 'root'
  return [
    `items:${userId}:${fId}:p1:l50`,
    `items:${userId}:${fId}:p1:l100`,
    `items:${userId}:${fId}:p2:l50`,
    `items:${userId}:${fId}:p2:l100`,
    `items:${userId}:${fId}:p3:l50`,
    `items:${userId}:${fId}:p3:l100`,
  ]
}

export async function patchFolderCache(
  userId: string,
  folderId: string | null,
  patch: FolderCachePatch,
): Promise<void> {
  const keys = folderItemsCacheKeys(userId, folderId)

  await Promise.all(
    keys.map(async (key) => {
      const current = await Cache.get<FolderItemsCacheValue>(key)
      if (!current) return

      const nextFolders = current.folders
        .map((folderItem) => {
          if (patch.renameFolder && folderItem.id === patch.renameFolder.id) {
            return { ...folderItem, name: patch.renameFolder.name }
          }
          return folderItem
        })
        .filter((folderItem) => !patch.removeFolderIds?.includes(folderItem.id))

      const nextFiles = current.files
        .map((fileItem) => {
          if (patch.renameFile && fileItem.id === patch.renameFile.id) {
            return { ...fileItem, name: patch.renameFile.name }
          }
          return fileItem
        })
        .filter((fileItem) => !patch.removeFileIds?.includes(fileItem.id))

      await Cache.set(
        key,
        {
          ...current,
          folders: nextFolders,
          files: nextFiles,
        },
        { expirationTtl: 60 },
      )
    }),
  )
}

export async function invalidateFolderCache(
  userId: string,
  folderId: string | null,
) {
  await Promise.all(folderItemsCacheKeys(userId, folderId).map(Cache.delete))
}

export async function invalidateQuotaCache(userId: string) {
  await Cache.delete(`quota:${userId}`)
}

export async function patchQuotaUsedStorage(
  userId: string,
  deltaBytes: number,
): Promise<void> {
  const cacheKey = `quota:${userId}`
  const current = await Cache.get<{
    usedStorage: number
    allocatedStorage: number
    fileSizeLimit: number
  }>(cacheKey)
  if (!current) return
  const nextUsedStorage = Math.max(0, current.usedStorage + deltaBytes)
  await Cache.set(
    cacheKey,
    { ...current, usedStorage: nextUsedStorage },
    { expirationTtl: 300 },
  )
}
