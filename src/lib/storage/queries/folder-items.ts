import { StorageService } from '@/lib/services/storage-service'

export type FolderItemsAuthContext = {
  user: {
    id: string
    isAdmin: boolean
  }
}

export type FolderItemsResult = {
  folders: Array<{
    id: string
    name: string
    createdAt: Date
    parentFolderId: string | null
    isPrivatelyLocked?: boolean
  }>
  files: Array<{
    id: string
    name: string
    sizeInBytes: number
    mimeType: string | null
    objectKey: string
    createdAt: Date
    isPrivatelyLocked?: boolean
  }>
}

export async function getTimeOrderedFolderItems(
  context: FolderItemsAuthContext,
  folderId: string | null,
  page: number,
  limit: number,
): Promise<FolderItemsResult> {
  const service = new StorageService({
    userId: context.user.id,
    isAdmin: context.user.isAdmin,
    requestId: crypto.randomUUID(),
  })
  const result = await service.listFolderItems({ folderId, page, limit })

  return {
    folders: result.items
      .filter((item) => item.itemType === 'folder')
      .map((item) => ({
        id: item.itemId,
        name: item.name,
        createdAt: item.createdAt,
        parentFolderId: item.parentFolderId,
        isPrivatelyLocked: false,
      })),
    files: result.items
      .filter((item) => item.itemType === 'file')
      .map((item) => ({
        id: item.itemId,
        name: item.name,
        sizeInBytes: item.size ?? 0,
        mimeType: item.mimeType ?? null,
        objectKey: '',
        createdAt: item.createdAt,
        isPrivatelyLocked: false,
      })),
  }
}
