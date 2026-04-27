import { createFolderFn } from '@/lib/storage-actions-server'
import type { UploadingFile } from '@/types/storage'

export type FlatFolderFile = {
  name: string
  file: File
  hash: string
  size: number
}

export function getParentPath(relativePath: string): string {
  const idx = relativePath.lastIndexOf('/')
  return idx === -1 ? '' : relativePath.slice(0, idx)
}

export async function resolvePathFolderId(
  path: string,
  rootFolderId: string,
  folderIdsByPath: Map<string, string>,
): Promise<string> {
  if (!path) return rootFolderId
  const cached = folderIdsByPath.get(path)
  if (cached) return cached

  const parentPath = getParentPath(path)
  const parentFolderId = await resolvePathFolderId(
    parentPath,
    rootFolderId,
    folderIdsByPath,
  )
  const folderName = path.slice(path.lastIndexOf('/') + 1)

  const { folder } = await createFolderFn({
    data: {
      name: folderName,
      parentFolderId,
    },
  })

  folderIdsByPath.set(path, folder.id)
  return folder.id
}

export function createUploadEntries(
  uploadId: string,
  rootFolderId: string,
  files: FlatFolderFile[],
): UploadingFile[] {
  return files.map((f, index) => ({
    id: `${uploadId}-${index}`,
    file: f.file,
    fileBlob: f.file.slice(0, f.file.size, f.file.type),
    fileName: f.file.name,
    progress: 0,
    status: 'uploading' as const,
    relativePath: f.name,
    targetFolderId: rootFolderId,
    folderUploadRootId: rootFolderId,
  }))
}
