import { authClient } from '@/lib/auth-client'
import { uploadFileViaProxy } from '@/lib/upload-proxy-client'
import { prepareUploadTarget } from '@/lib/upload-target-server'
import type { UploadingFile } from '@/types/storage'

export type UploadStateUpdater = React.Dispatch<
  React.SetStateAction<UploadingFile[]>
>

export async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function computeFolderHashes(
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

export async function computeFilesHashes(
  items: Array<{ file: File; relativePath: string }>,
): Promise<Map<string, { file: File; hash: string; size: number }>> {
  const result = new Map<string, { file: File; hash: string; size: number }>()
  for (const { file, relativePath } of items) {
    const hash = await computeFileHash(file)
    result.set(relativePath, { file, hash, size: file.size })
  }
  return result
}

export function getFolderNameFromEntry(entry: FileSystemEntry): string {
  if (entry.isDirectory) {
    return entry.name
  }
  const pathParts = (entry as FileSystemFileEntry).fullPath.split('/')
  return pathParts.length > 1 ? pathParts[1] : 'Uploaded Folder'
}

export function flattenFileMap(
  fileMap: Map<string, { file: File; hash: string; size: number }>,
): { name: string; file: File; hash: string; size: number }[] {
  return Array.from(fileMap.entries()).map(([path, data]) => ({
    name: path,
    file: data.file,
    hash: data.hash,
    size: data.size,
  }))
}

export async function uploadSingleFileWithProgress(
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

    if (target.uploadMethod === 'proxy') {
      return await uploadFileViaProxy({
        uploadUrl: target.uploadUrl,
        providerId: target.providerId ?? null,
        objectKey,
        file,
        contentType,
        onProgress: (progress) => onProgress(Math.min(90, progress)),
      })
    } else {
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
        xhr.open('PUT', target.presignedUrl)
        xhr.setRequestHeader('Content-Type', contentType)
        xhr.send(file)
      })

      return target.providerId ?? null
    }
  } catch (error: unknown) {
    throw new Error(toErrorMessage(error))
  }
}

export type FolderUploadResult = {
  success: boolean
  folderId?: string
  folderName?: string
  filesCount?: number
  error?: string
}

export async function resolveUserId(
  uid: string | null,
): Promise<string | null> {
  if (uid) return uid
  const { data } = await authClient.getSession()
  return data?.user?.id ?? null
}
