import { authClient } from '@/lib/auth-client'
import {
  initFolderUpload,
  completeFolderUpload,
  abortFolderUpload,
} from '@/lib/folder-upload-server'
import { prepareUploadTarget } from '@/lib/upload-target-server'
import type { UploadingFile } from '@/types/storage'

type UploadStateUpdater = React.Dispatch<React.SetStateAction<UploadingFile[]>>

async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function computeFolderHashes(
  items: FileSystemEntry[],
): Promise<Map<string, { file: File; hash: string; size: number }>> {
  const result = new Map<string, { file: File; hash: string; size: number }>()

  const processEntry = async (entry: FileSystemEntry, path: string) => {
    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry
      const file = await new Promise<File>((resolve, reject) => {
        fileEntry.file(resolve, reject)
      })
      const hash = await computeFileHash(file)
      result.set(path, { file, hash, size: file.size })
    } else if (entry.isDirectory) {
      const dirEntry = entry as FileSystemDirectoryEntry
      const reader = dirEntry.createReader()
      const entries = await new Promise<FileSystemEntry[]>(
        (resolve, reject) => {
          reader.readEntries(resolve, reject)
        },
      )
      for (const child of entries) {
        await processEntry(child, `${path}/${child.name}`)
      }
    }
  }

  for (const entry of items) {
    await processEntry(entry, entry.name)
  }

  return result
}

function getFolderNameFromEntry(entry: FileSystemEntry): string {
  if (entry.isDirectory) {
    return entry.name
  }
  const pathParts = (entry as FileSystemFileEntry).fullPath.split('/')
  return pathParts.length > 1 ? pathParts[1] : 'Uploaded Folder'
}

function flattenFileMap(
  fileMap: Map<string, { file: File; hash: string; size: number }>,
): { name: string; file: File; hash: string; size: number }[] {
  return Array.from(fileMap.entries()).map(([path, data]) => ({
    name: path,
    file: data.file,
    hash: data.hash,
    size: data.size,
  }))
}

export type FolderUploadResult = {
  success: boolean
  folderId?: string
  folderName?: string
  filesCount?: number
  error?: string
}

async function uploadSingleFileWithProgress(
  file: File,
  objectKey: string,
  _uploadId: string,
  _setUploads: UploadStateUpdater,
  onProgress: (progress: number) => void,
): Promise<string | null> {
  function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Folder file upload failed'
  }

  const contentType = file.type || 'application/octet-stream'

  try {
    const target = await prepareUploadTarget({
      data: {
        objectKey,
        contentType,
        fileSize: file.size,
      },
    })

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          onProgress(Math.min(90, progress))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`Upload failed: HTTP ${xhr.status}`))
        }
      }

      xhr.onerror = () => reject(new Error('Network error during upload'))
      if (target.uploadMethod === 'proxy') {
        xhr.open('POST', target.uploadUrl)
        xhr.setRequestHeader('X-Upload-Object-Key', objectKey)
        xhr.setRequestHeader('X-Upload-File-Size', String(file.size))
        xhr.setRequestHeader('X-Upload-Provider-Id', target.providerId ?? '')
      } else {
        xhr.open('PUT', target.presignedUrl)
      }
      xhr.setRequestHeader('Content-Type', contentType)
      xhr.send(file)
    })

    return target.providerId ?? null
  } catch (error: unknown) {
    throw new Error(toErrorMessage(error))
  }
}

export async function uploadFolder(
  folderEntry: FileSystemDirectoryEntry,
  _userId: string,
  parentFolderId: string | null,
  setUploads: UploadStateUpdater,
): Promise<FolderUploadResult> {
  const uploadId = crypto.randomUUID()
  const folderName = getFolderNameFromEntry(folderEntry)

  const reader = folderEntry.createReader()
  const allEntries: FileSystemEntry[] = []

  const readEntries = (): Promise<FileSystemEntry[]> => {
    return new Promise((resolve, reject) => {
      reader.readEntries(resolve, reject)
    })
  }

  let entries: FileSystemEntry[] = []
  do {
    entries = await readEntries()
    allEntries.push(...entries)
  } while (entries.length > 0)

  const fileMap = await computeFolderHashes(allEntries)
  const flatFiles = flattenFileMap(fileMap)

  if (flatFiles.length === 0) {
    return { success: false, error: 'No files found in folder' }
  }

  const totalSize = flatFiles.reduce((sum, f) => sum + f.size, 0)

  const placeholderUploads: UploadingFile[] = flatFiles.map((f) => ({
    id: `${uploadId}-${f.name}`,
    file: f.file,
    progress: 0,
    status: 'uploading' as const,
  }))

  setUploads((prev) => [...placeholderUploads, ...prev])

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
      .map((f) => initResponse?.objectKeys[f.name])
      .filter((k): k is string => typeof k === 'string')

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
            fileSize: f.size,
            mimeType: f.file.type || null,
            providerId: providerIdByObjectKey.get(completedObjectKey) ?? null,
          }
        }),
        providerId: undefined,
      },
    })

    for (const fileData of flatFiles) {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === `${uploadId}-${fileData.name}`
            ? { ...u, progress: 100, status: 'completed' as const }
            : u,
        ),
      )

      setTimeout(() => {
        setUploads((prev) =>
          prev.filter((u) => u.id !== `${uploadId}-${fileData.name}`),
        )
      }, 1500)
    }

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

    return { success: false, error: errorMessage }
  }
}

export async function resolveUserId(
  uid: string | null,
): Promise<string | null> {
  if (uid) return uid
  const { data } = await authClient.getSession()
  return data?.user?.id ?? null
}
