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
import type { UploadStateUpdater, UploadingFile } from './folder-upload-core'
import type { FolderUploadResult } from './folder-upload-core'

export async function uploadFolderFromFiles({
  folderName,
  files,
  userId,
  parentFolderId,
  setUploads,
}: {
  folderName: string
  files: Array<{ file: File; relativePath: string }>
  userId: string
  parentFolderId: string | null
  setUploads: UploadStateUpdater
}): Promise<FolderUploadResult> {
  const uploadId = crypto.randomUUID()

  const fileMap = await computeFilesHashes(files)
  const flatFiles = flattenFileMap(fileMap)

  if (flatFiles.length === 0) {
    return { success: false, error: 'No files found in folder' }
  }

  const totalFiles = flatFiles.length
  const totalSize = flatFiles.reduce((sum, f) => sum + f.size, 0)

  const folderUploadId = `${uploadId}-folder`
  const folderUploadEntry = {
    id: folderUploadId,
    progress: 0,
    status: 'uploading' as const,
    folderName,
    totalFilesCount: totalFiles,
    uploadedFilesCount: 0,
  }

  const childFileEntries: UploadingFile[] = flatFiles.map((f) => ({
    id: `${uploadId}-${f.name}`,
    file: f.file,
    progress: 0,
    status: 'uploading' as const,
    parentUploadId: folderUploadId,
  }))

  setUploads((prev) => [folderUploadEntry, ...childFileEntries, ...prev])

  let uploadedObjectKeys: string[] = []
  const providerIdByObjectKey = new Map<string, string | null>()
  let initResponse: {
    uploadSessionId: string
    objectKeys: Record<string, string>
  } | null = null

  try {
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

    uploadedObjectKeys = flatFiles
      .map((f) => initResponse!.objectKeys[f.name])
      .filter((k): k is string => typeof k === 'string')

    let processedCount = 0
    for (const fileData of flatFiles) {
      const objectKey = initResponse.objectKeys[fileData.name]
      if (!objectKey) continue

      let providerId: string | null = null

      providerId = await uploadSingleFileWithProgress(
        fileData.file,
        objectKey,
        `${uploadId}-${fileData.name}`,
        setUploads,
        (progress) => {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === `${uploadId}-${fileData.name}` ? { ...u, progress } : u,
            ),
          )
        },
      )
      providerIdByObjectKey.set(objectKey, providerId)

      setUploads((prev) =>
        prev.map((u) =>
          u.id === `${uploadId}-${fileData.name}` ? { ...u, progress: 95 } : u,
        ),
      )

      processedCount++
      const newFolderProgress = Math.round((processedCount / totalFiles) * 100)
      setUploads((prev) =>
        prev.map((u) =>
          u.id === folderUploadId
            ? {
                ...u,
                uploadedFilesCount: processedCount,
                progress: newFolderProgress,
              }
            : u,
        ),
      )
    }

    const completeResponse = await completeFolderUpload({
      data: {
        uploadSessionId: initResponse!.uploadSessionId,
        folderName,
        parentFolderId,
        files: flatFiles.map((f) => {
          const completedObjectKey = initResponse!.objectKeys[f.name]
          return {
            fileName: f.file.name,
            objectKey: completedObjectKey,
            sha256Hash: f.hash,
            fileSize: f.file.size,
            mimeType: f.file.type || null,
            providerId: providerIdByObjectKey.get(completedObjectKey) ?? null,
          }
        }),
        providerId: undefined,
      },
    })

    setUploads((prev) =>
      prev.map((u) =>
        u.parentUploadId === folderUploadId
          ? { ...u, progress: 100, status: 'completed' as const }
          : u,
      ),
    )

    setUploads((prev) =>
      prev.map((u) =>
        u.id === folderUploadId
          ? { ...u, status: 'completed' as const, progress: 100 }
          : u,
      ),
    )

    return {
      success: true,
      folderId: completeResponse.folderId,
      folderName,
      filesCount: completeResponse.filesCount,
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Folder upload failed'

    if (initResponse?.uploadSessionId) {
      try {
        await abortFolderUpload({
          data: {
            uploadSessionId: initResponse.uploadSessionId,
            objectKeys: uploadedObjectKeys,
          },
        })
      } catch {
        // Best effort cleanup
      }
    }

    for (const fileData of flatFiles) {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === `${uploadId}-${fileData.name}`
            ? { ...u, status: 'failed' as const, error: errorMessage }
            : u,
        ),
      )
    }

    setUploads((prev) =>
      prev.map((u) =>
        u.id === folderUploadId
          ? {
              ...u,
              status: 'failed' as const,
              progress: 100,
              uploadedFilesCount: totalFiles,
              error: errorMessage,
            }
          : u,
      ),
    )

    return { success: false, error: errorMessage }
  }
}
