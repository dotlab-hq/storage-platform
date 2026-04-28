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

// Track folders created during this upload session to avoid duplicates
const pendingFolderCreates = new Map<string, Promise<string>>()

export async function resolvePathFolderId(
  path: string,
  rootFolderId: string,
  folderIdsByPath: Map<string, string>,
  _userId: string,
): Promise<string> {
  if (!path) return rootFolderId
  const cached = folderIdsByPath.get(path)
  if (cached) return cached

  const parentPath = getParentPath(path)
  const parentFolderId = await resolvePathFolderId(
    parentPath,
    rootFolderId,
    folderIdsByPath,
    _userId,
  )
  const folderName = path.slice(path.lastIndexOf('/') + 1)

  // Create folder - createFolderFn handles deduplication by checking existing names
  const { folder: newFolder } = await createFolderFn({
    data: {
      name: folderName,
      parentFolderId,
    },
  })

  folderIdsByPath.set(path, newFolder.id)
  return newFolder.id
}

export function createUploadEntries(
  uploadId: string,
  rootFolderId: string,
  files: FlatFolderFile[],
  folderName?: string,
): UploadingFile[] {
  // Create only ONE entry per folder upload instead of one per file
  // The entry represents the entire folder upload with aggregated progress
  return [
    {
      id: uploadId,
      file: undefined,
      fileName: folderName ?? files[0]?.file.name ?? 'Folder',
      progress: 0,
      status: 'uploading' as const,
      relativePath: undefined,
      targetFolderId: rootFolderId,
      folderUploadRootId: rootFolderId,
      folderName,
      totalFilesCount: files.length,
      uploadedFilesCount: 0,
    },
  ]
}
