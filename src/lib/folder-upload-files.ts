import {
  computeFilesHashes,
  flattenFileMap,
  uploadSingleFileWithProgress,
} from './folder-upload-core'
import {
  initFolderUpload,
  completeFolderUpload,
  abortFolderUpload,
} from '@/lib/folder-upload-server'
import type {
  UploadStateUpdater,
  FolderUploadResult,
} from './folder-upload-core'
import type { UploadingFile } from '@/types/storage'

const DEFAULT_FOLDER_FILE_CONCURRENCY = 8
const DEFAULT_FILE_UPLOAD_ATTEMPTS = 3

async function uploadFolderFileWithRetry(args: {
  uploadId: string
  fileName: string
  file: File
  objectKey: string
  setUploads: UploadStateUpdater
  maxAttempts: number
}): Promise<string | null> {
  const { uploadId, fileName, file, objectKey, setUploads, maxAttempts } = args

  let attempt = 0
  let lastError: string | null = null

  while (attempt < maxAttempts) {
    attempt += 1
    try {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === `${uploadId}-${fileName}`
            ? { ...u, status: 'uploading' as const, error: undefined }
            : u,
        ),
      )

      const providerId = await uploadSingleFileWithProgress(
        file,
        objectKey,
        `${uploadId}-${fileName}`,
        setUploads,
        (progress) => {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === `${uploadId}-${fileName}` ? { ...u, progress } : u,
            ),
          )
        },
      )

      setUploads((prev) =>
        prev.map((u) =>
          u.id === `${uploadId}-${fileName}`
            ? { ...u, progress: 95, error: undefined }
            : u,
        ),
      )

      return providerId
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : 'Folder file upload failed'
      // If this was the last attempt, the loop will exit naturally
    }
  }

  // All attempts failed
  setUploads((prev) =>
    prev.map((u) =>
      u.id === `${uploadId}-${fileName}`
        ? { ...u, status: 'failed' as const, error: lastError! }
        : u,
    ),
  )
  return null
}

export async function uploadFolderFromFiles({
  folderName,
  files,
  userId: _userId,
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

  const totalSize = flatFiles.reduce((sum, f) => sum + f.size, 0)

  // Create child file entries only (no optimistic folder-level card)
  const childFileEntries: UploadingFile[] = flatFiles.map((f) => ({
    id: `${uploadId}-${f.name}`,
    file: f.file,
    progress: 0,
    status: 'uploading' as const,
    targetFolderId: parentFolderId,
  }))

  setUploads((prev) => [...childFileEntries, ...prev])

  let initResponse: {
    uploadSessionId: string
    objectKeys: Record<string, string>
  } | null = null

  try {
    // Step 1: Initialize multipart upload session for all files
    initResponse = await initFolderUpload({
      data: {
        folderName,
        parentFolderId,
        files: flatFiles.map((f) => ({
          fileName: f.name,
          fileSize: f.size,
          sha256Hash: f.hash,
        })),
        totalSize,
      },
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

    // Queue-based worker assignment (avoids race conditions)
    const queue: typeof flatFiles = [...flatFiles]
    const succeeded: Array<{
      fileData: (typeof flatFiles)[0]
      objectKey: string
      providerId: string | null
    }> = []
    const failedObjectKeys: string[] = []

    const worker = async () => {
      while (queue.length > 0) {
        const fileData = queue.shift()!
        const objectKey = initResponse!.objectKeys[fileData.name]
        if (!objectKey) continue

        const providerId = await uploadFolderFileWithRetry({
          uploadId,
          fileName: fileData.name,
          file: fileData.file,
          objectKey,
          setUploads,
          maxAttempts,
        })

        if (providerId) {
          succeeded.push({ fileData, objectKey, providerId })
        } else {
          failedObjectKeys.push(objectKey)
        }
      }
    }

    await Promise.all(Array.from({ length: fileConcurrency }, () => worker()))

    // Step 2: Handle upload results
    if (succeeded.length > 0) {
      try {
        // Try to finalize the folder with only successfully uploaded files
        const completeResponse = await completeFolderUpload({
          data: {
            uploadSessionId: initResponse!.uploadSessionId,
            folderName,
            parentFolderId,
            files: succeeded.map((s) => ({
              fileName: s.fileData.file.name,
              objectKey: s.objectKey,
              sha256Hash: s.fileData.hash,
              fileSize: s.fileData.file.size,
              mimeType: s.fileData.file.type || null,
              providerId: s.providerId,
            })),
            providerId: undefined,
          },
        })

        // Mark succeeded files as completed
        for (const s of succeeded) {
          const fileId = `${uploadId}-${s.fileData.name}`
          setUploads((prev) =>
            prev.map((u) =>
              u.id === fileId
                ? { ...u, progress: 100, status: 'completed' as const }
                : u,
            ),
          )
        }

        // Clean up any failed files' partial uploads from S3
        if (failedObjectKeys.length > 0) {
          try {
            await abortFolderUpload({
              data: {
                uploadSessionId: initResponse.uploadSessionId,
                objectKeys: failedObjectKeys,
              },
            })
          } catch {
            // best effort
          }
        }

        return {
          success: true,
          folderId: completeResponse.folderId,
          folderName,
          filesCount: succeeded.length,
        }
      } catch (completeErr) {
        // Completion failed: mark succeeded files as failed and clean up all S3 objects
        for (const s of succeeded) {
          const fileId = `${uploadId}-${s.fileData.name}`
          setUploads((prev) =>
            prev.map((u) =>
              u.id === fileId
                ? {
                    ...u,
                    status: 'failed' as const,
                    error: 'Folder registration failed',
                  }
                : u,
            ),
          )
        }
        const allKeys = [
          ...succeeded.map((s) => s.objectKey),
          ...failedObjectKeys,
        ]
        try {
          await abortFolderUpload({
            data: {
              uploadSessionId: initResponse.uploadSessionId,
              objectKeys: allKeys,
            },
          })
        } catch {}
        return {
          success: false,
          error:
            completeErr instanceof Error
              ? completeErr.message
              : 'Folder registration failed',
        }
      }
    } else {
      // All files failed individually
      try {
        await abortFolderUpload({
          data: {
            uploadSessionId: initResponse!.uploadSessionId,
            objectKeys: failedObjectKeys,
          },
        })
      } catch {}
      return { success: false, error: 'All files failed to upload' }
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Folder upload failed'

    // If init started but workers didn't finish, cleanup any uploaded objects
    if (initResponse) {
      const allKeys = flatFiles
        .map((f) => initResponse!.objectKeys[f.name])
        .filter((k): k is string => typeof k === 'string')
      try {
        await abortFolderUpload({
          data: {
            uploadSessionId: initResponse!.uploadSessionId,
            objectKeys: allKeys,
          },
        })
      } catch {}
    }

    // Mark any files that are still uploading as failed
    for (const fileData of flatFiles) {
      const fileId = `${uploadId}-${fileData.name}`
      setUploads((prev) =>
        prev.map((u) =>
          u.id === fileId
            ? { ...u, status: 'failed' as const, error: errorMessage }
            : u,
        ),
      )
    }

    return { success: false, error: errorMessage }
  }
}
