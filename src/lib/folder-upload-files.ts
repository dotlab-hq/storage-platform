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
  folderName?: string
}

async function uploadFolderFiles({
  files,
  userId,
  rootFolderId,
  setUploads,
  uploadId,
  fileConcurrency,
  maxAttempts,
  folderName,
}: UploadFolderFilesArgs): Promise<number> {
  const uploadEntries = createUploadEntries(
    uploadId,
    rootFolderId,
    files,
    folderName,
  )
  const folderEntryId = uploadEntries[0].id
  setUploads((prev) => [...uploadEntries, ...prev])

  const folderIdsByPath = new Map<string, string>()
  const queue: FlatFolderFile[] = [...files]
  let succeeded = 0

  const updateFolderProgress = (uploadedCount: number) => {
    const totalCount = files.length
    const progress =
      totalCount > 0 ? Math.round((uploadedCount / totalCount) * 100) : 0
    setUploads((prev) =>
      prev.map((u) =>
        u.id === folderEntryId
          ? {
              ...u,
              progress,
              uploadedFilesCount: uploadedCount,
            }
          : u,
      ),
    )
  }

  const worker = async () => {
    while (queue.length > 0) {
      const fileData = queue.shift()
      if (!fileData) break

      let attempt = 0
      while (attempt < maxAttempts) {
        attempt += 1
        try {
          const targetPath = getParentPath(fileData.name)
          const targetFolderId = await resolvePathFolderId(
            targetPath,
            rootFolderId,
            folderIdsByPath,
            userId,
          )

          await uploadFileToS3(
            fileData.file,
            userId,
            targetFolderId,
            (_progress) => {
              // Individual file progress not needed - folder shows aggregate
            },
          )

          succeeded += 1
          updateFolderProgress(succeeded)
          break
        } catch (error: unknown) {
          // ignore error and retry
        }
      }
    }
  }

  await Promise.all(Array.from({ length: fileConcurrency }, () => worker()))

  // Final status update
  const allSucceeded = succeeded === files.length
  setUploads((prev) =>
    prev.map((u) =>
      u.id === folderEntryId
        ? {
            ...u,
            progress: 100,
            status: allSucceeded ? 'completed' : 'failed',
            uploadedFilesCount: succeeded,
            error: allSucceeded ? undefined : 'Some files failed to upload',
          }
        : u,
    ),
  )

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
    folderName,
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
