import { uploadFileToS3 } from '@/lib/upload-utils'
import { createFolderFn } from '@/lib/storage-actions-server'
import { computeFilesHashes, flattenFileMap } from './folder-upload-core'
import {
  createUploadEntries,
  getParentPath,
  resolvePathFolderId,
  type FlatFolderFile,
} from './folder-upload-files.helpers'
import type {
  FolderUploadResult,
  UploadStateUpdater,
} from './folder-upload-core'

const DEFAULT_FOLDER_FILE_CONCURRENCY = 8
const DEFAULT_FILE_UPLOAD_ATTEMPTS = 3

type UploadFolderFilesArgs = {
  files: FlatFolderFile[]
  userId: string
  rootFolderId: string
  setUploads: UploadStateUpdater
  uploadId: string
  fileConcurrency: number
  maxAttempts: number
}

async function uploadFolderFiles({
  files,
  userId,
  rootFolderId,
  setUploads,
  uploadId,
  fileConcurrency,
  maxAttempts,
}: UploadFolderFilesArgs): Promise<number> {
  const uploadEntries = createUploadEntries(uploadId, rootFolderId, files)
  const entryIdByPath = new Map<string, string>()
  for (let i = 0; i < files.length; i += 1) {
    entryIdByPath.set(files[i].name, uploadEntries[i].id)
  }
  setUploads((prev) => [...uploadEntries, ...prev])

  const folderIdsByPath = new Map<string, string>()
  const queue: FlatFolderFile[] = [...files]
  let succeeded = 0

  const worker = async () => {
    while (queue.length > 0) {
      const fileData = queue.shift()
      if (!fileData) break
      const entryId = entryIdByPath.get(fileData.name)
      if (!entryId) continue

      let attempt = 0
      let lastError = 'Folder file upload failed'
      while (attempt < maxAttempts) {
        attempt += 1
        try {
          const targetPath = getParentPath(fileData.name)
          const targetFolderId = await resolvePathFolderId(
            targetPath,
            rootFolderId,
            folderIdsByPath,
          )

          setUploads((prev) =>
            prev.map((u) =>
              u.id === entryId
                ? {
                    ...u,
                    status: 'uploading' as const,
                    error: undefined,
                    targetFolderId,
                    folderUploadRootId: rootFolderId,
                  }
                : u,
            ),
          )

          await uploadFileToS3(
            fileData.file,
            userId,
            targetFolderId,
            (progress) => {
              setUploads((prev) =>
                prev.map((u) => (u.id === entryId ? { ...u, progress } : u)),
              )
            },
          )

          setUploads((prev) =>
            prev.map((u) =>
              u.id === entryId
                ? { ...u, progress: 100, status: 'completed' as const }
                : u,
            ),
          )
          succeeded += 1
          break
        } catch (error: unknown) {
          lastError =
            error instanceof Error ? error.message : 'Folder file upload failed'
        }
      }

      if (attempt >= maxAttempts) {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === entryId
              ? { ...u, status: 'failed' as const, error: lastError }
              : u,
          ),
        )
      }
    }
  }

  await Promise.all(Array.from({ length: fileConcurrency }, () => worker()))
  return succeeded
}

export async function uploadFolderFromFiles({
  folderName,
  files,
  userId,
  parentFolderId,
  setUploads,
  options,
}: {
  folderName: string
  files: Array<{ file: File; relativePath: string }>
  userId: string
  parentFolderId: string | null
  setUploads: UploadStateUpdater
  options?: {
    fileConcurrency?: number
    maxAttempts?: number
  }
}): Promise<FolderUploadResult> {
  const uploadId = crypto.randomUUID()
  const fileMap = await computeFilesHashes(files)
  const flatFiles = flattenFileMap(fileMap)
  if (flatFiles.length === 0) {
    return { success: false, error: 'No files found in folder' }
  }

  const { folder: rootFolder } = await createFolderFn({
    data: { name: folderName, parentFolderId },
  })

  const fileConcurrency = Math.max(
    1,
    Math.min(
      options?.fileConcurrency ?? DEFAULT_FOLDER_FILE_CONCURRENCY,
      flatFiles.length,
    ),
  )
  const maxAttempts = Math.max(
    1,
    options?.maxAttempts ?? DEFAULT_FILE_UPLOAD_ATTEMPTS,
  )

  const succeeded = await uploadFolderFiles({
    files: flatFiles,
    userId,
    rootFolderId: rootFolder.id,
    setUploads,
    uploadId,
    fileConcurrency,
    maxAttempts,
  })

  return succeeded > 0
    ? {
        success: true,
        folderId: rootFolder.id,
        folderName,
        filesCount: succeeded,
      }
    : {
        success: false,
        folderName,
        error: 'All files failed to upload',
      }
}
