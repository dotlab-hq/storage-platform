import type { UploadingFile } from '@/types/storage'
import type React from 'react'
import {
  uploadPresign,
  uploadMultipartInit,
  uploadMultipartComplete,
  registerFile,
} from './upload-server'

type UploadStateUpdater = React.Dispatch<React.SetStateAction<UploadingFile[]>>

const MIN_PART_SIZE_BYTES = 5 * 1024 * 1024
const MAX_MULTIPART_PARTS = 10000
const TARGET_PART_COUNT = 8
const MIN_MULTIPART_FILE_SIZE_BYTES = 8 * 1024 * 1024
const SINGLE_FILE_PART_CONCURRENCY = 8

export type CompletedFileInfo = {
  id: string
  name: string
  mimeType: string | null
  sizeInBytes: number
  objectKey: string
  createdAt: Date
}

/**
 * Get a presigned URL for uploading a file to S3.
 */
async function fetchPresignedUrl(
  objectKey: string,
  contentType: string,
  fileSize: number,
): Promise<{ presignedUrl: string; providerId: string | null }> {
  try {
    const data = await uploadPresign({
      data: { objectKey, contentType, fileSize },
    })
    return {
      presignedUrl: data.presignedUrl,
      providerId: data.providerId ?? null,
    }
  } catch (err: any) {
    throw new Error(err.message ?? 'Failed to get presigned URL')
  }
}

async function fetchMultipartSession(
  objectKey: string,
  contentType: string,
  fileSize: number,
  partCount: number,
): Promise<{
  uploadId: string
  providerId: string | null
  partUrls: { partNumber: number; presignedUrl: string }[]
}> {
  try {
    const data = await uploadMultipartInit({
      data: { objectKey, contentType, fileSize, partCount },
    })
    return {
      uploadId: data.uploadId,
      providerId: data.providerId ?? null,
      partUrls: data.partUrls,
    }
  } catch (err: any) {
    throw new Error(err.message ?? 'Failed to initialize multipart upload')
  }
}

async function completeMultipartUpload(
  objectKey: string,
  uploadId: string,
  providerId: string | null,
): Promise<void> {
  try {
    await uploadMultipartComplete({
      data: { objectKey, uploadId, providerId },
    })
  } catch (err: any) {
    throw new Error(err.message ?? 'Failed to finalize multipart upload')
  }
}

function computePartSize(fileSize: number): number {
  return Math.max(
    MIN_PART_SIZE_BYTES,
    Math.ceil(fileSize / TARGET_PART_COUNT),
    Math.ceil(fileSize / MAX_MULTIPART_PARTS),
  )
}

function uploadPartWithXhr(
  presignedUrl: string,
  chunk: Blob,
  onPartProgress: (loadedBytes: number) => void,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onPartProgress(e.loaded)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onPartProgress(chunk.size)
        resolve()
      } else {
        reject(new Error(`Multipart upload part failed: HTTP ${xhr.status}`))
      }
    }

    xhr.onerror = () =>
      reject(new Error('Network error during multipart upload'))
    xhr.open('PUT', presignedUrl)
    xhr.send(chunk)
  })
}

async function uploadFileMultipart(
  file: File,
  objectKey: string,
  contentType: string,
  onProgress: (progress: number) => void,
): Promise<string | null> {
  const partSize = computePartSize(file.size)
  const partCount = Math.ceil(file.size / partSize)

  const { uploadId, providerId, partUrls } = await fetchMultipartSession(
    objectKey,
    contentType,
    file.size,
    partCount,
  )

  const sortedPartUrls = [...partUrls].sort(
    (a, b) => a.partNumber - b.partNumber,
  )
  if (sortedPartUrls.length !== partCount) {
    throw new Error(
      'Multipart upload initialization returned an unexpected number of part URLs',
    )
  }

  const loadedByPart = new Array<number>(partCount).fill(0)
  let totalLoaded = 0
  let nextPartIndex = 0

  const uploadWorker = async () => {
    while (true) {
      const currentIndex = nextPartIndex
      nextPartIndex += 1
      if (currentIndex >= partCount) {
        break
      }

      const partNumber = currentIndex + 1
      const start = currentIndex * partSize
      const end = Math.min(start + partSize, file.size)
      const chunk = file.slice(start, end)
      const presignedUrl = sortedPartUrls[currentIndex]?.presignedUrl

      if (!presignedUrl) {
        throw new Error(`Missing presigned URL for part ${partNumber}`)
      }

      await uploadPartWithXhr(presignedUrl, chunk, (loadedBytes) => {
        totalLoaded += loadedBytes - loadedByPart[currentIndex]
        loadedByPart[currentIndex] = loadedBytes
        onProgress(Math.min(99, Math.round((totalLoaded / file.size) * 100)))
      })
    }
  }

  const workerCount = Math.min(SINGLE_FILE_PART_CONCURRENCY, partCount)
  await Promise.all(Array.from({ length: workerCount }, () => uploadWorker()))

  await completeMultipartUpload(objectKey, uploadId, providerId)
  onProgress(100)
  return providerId
}

/**
 * Register an uploaded file in the database.
 * Returns the newly-created file record.
 */
async function registerFileInDb(
  fileName: string,
  objectKey: string,
  mimeType: string,
  fileSize: number,
  parentFolderId: string | null,
  providerId: string | null,
): Promise<CompletedFileInfo> {
  try {
    const data = await registerFile({
      data: {
        fileName,
        objectKey,
        mimeType,
        fileSize,
        parentFolderId,
        providerId,
      },
    })
    if (!data.file) {
      throw new Error('Failed to register file')
    }
    return {
      id: data.file.id,
      name: data.file.name,
      mimeType: data.file.mimeType,
      sizeInBytes: data.file.sizeInBytes,
      objectKey: data.file.objectKey,
      createdAt: new Date(),
    }
  } catch (err: any) {
    throw new Error(err.message ?? 'Failed to register file')
  }
}

/**
 * Upload a single file directly to S3 using a presigned URL.
 * Returns the registered file record for optimistic UI updates.
 */
export async function uploadFileToS3(
  file: File,
  userId: string,
  folderId: string | null,
  onProgress: (progress: number) => void,
): Promise<CompletedFileInfo> {
  if (!userId) {
    throw new Error('User ID is required for upload')
  }

  const dotIndex = file.name.lastIndexOf('.')
  const base =
    (dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name)
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '') || 'file'
  const ext =
    dotIndex > 0
      ? `.${file.name.slice(dotIndex + 1).replace(/[^a-zA-Z0-9]/g, '')}`
      : ''
  const objectKey = `${userId}/${crypto.randomUUID()}-${base}${ext}`
  const contentType = file.type || 'application/octet-stream'

  let providerId: string | null

  if (file.size >= MIN_MULTIPART_FILE_SIZE_BYTES) {
    providerId = await uploadFileMultipart(
      file,
      objectKey,
      contentType,
      onProgress,
    )
  } else {
    // Step 1: Get presigned URL
    const singleUpload = await fetchPresignedUrl(
      objectKey,
      contentType,
      file.size,
    )
    providerId = singleUpload.providerId

    // Step 2: Upload directly to S3
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`S3 upload failed: HTTP ${xhr.status}`))
        }
      }

      xhr.onerror = () => reject(new Error('Network error during S3 upload'))
      xhr.open('PUT', singleUpload.presignedUrl)
      xhr.setRequestHeader('Content-Type', contentType)
      xhr.send(file)
    })
  }

  // Step 3: Register file in database and return file info
  return registerFileInDb(
    file.name,
    objectKey,
    contentType,
    file.size,
    folderId,
    providerId,
  )
}

/**
 * Upload a batch of files with a concurrency limit (default 3).
 * Progress / status updates are pushed to the global uploads state.
 * Calls onFileUploaded after each successful upload for optimistic UI.
 * Returns the number of successfully uploaded files.
 */
export async function uploadBatch(
  files: { id: string; file: File }[],
  userId: string,
  folderId: string | null,
  concurrency: number,
  setUploads: UploadStateUpdater,
  onFileUploaded?: (file: CompletedFileInfo) => void,
): Promise<number> {
  let completed = 0
  const queue = [...files]

  const worker = async () => {
    while (queue.length > 0) {
      const task = queue.shift()
      if (!task) break
      try {
        const fileInfo = await uploadFileToS3(
          task.file,
          userId,
          folderId,
          (progress) => {
            setUploads((prev) =>
              prev.map((u) => (u.id === task.id ? { ...u, progress } : u)),
            )
          },
        )
        setUploads((prev) =>
          prev.map((u) =>
            u.id === task.id
              ? { ...u, progress: 100, status: 'completed' as const }
              : u,
          ),
        )
        onFileUploaded?.(fileInfo)
        completed++
        setTimeout(() => {
          setUploads((prev) => prev.filter((u) => u.id !== task.id))
        }, 1500)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setUploads((prev) =>
          prev.map((u) =>
            u.id === task.id
              ? { ...u, status: 'failed' as const, error: msg }
              : u,
          ),
        )
      }
    }
  }

  const workerCount = Math.min(concurrency, files.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return completed
}
