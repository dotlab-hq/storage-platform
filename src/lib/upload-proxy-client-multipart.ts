import { PROXY_PART_CONCURRENCY } from '@/lib/upload-proxy-constants'
import {
  computePartSize,
  readErrorBody,
} from '@/lib/upload-proxy-client-shared'

function uploadProxyPart(args: {
  uploadUrl: string
  providerId: string | null
  objectKey: string
  uploadId: string
  partNumber: number
  chunk: Blob
  onPartProgress: (loadedBytes: number) => void
}): Promise<void> {
  const { uploadUrl, providerId, objectKey, uploadId, partNumber, chunk } = args

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        args.onPartProgress(event.loaded)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        args.onPartProgress(chunk.size)
        resolve()
        return
      }
      reject(new Error(`Proxy multipart part failed: HTTP ${xhr.status}`))
    }

    xhr.onerror = () =>
      reject(new Error('Network error during proxy part upload'))
    xhr.open('POST', uploadUrl)
    xhr.setRequestHeader('Content-Type', 'application/octet-stream')
    xhr.setRequestHeader('X-Upload-Action', 'part')
    xhr.setRequestHeader('X-Upload-Object-Key', objectKey)
    xhr.setRequestHeader('X-Upload-Provider-Id', providerId ?? '')
    xhr.setRequestHeader('X-Upload-Id', uploadId)
    xhr.setRequestHeader('X-Upload-Part-Number', String(partNumber))
    xhr.setRequestHeader('X-Upload-Part-Size', String(chunk.size))
    xhr.send(chunk)
  })
}

// Simple semaphore to limit concurrent operations
function createSemaphore(limit: number) {
  let current = 0
  const queue: (() => void)[] = []

  const run = <T>(fn: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        current++
        try {
          const result = await fn()
          resolve(result)
        } catch (err) {
          reject(err)
        } finally {
          current--
          if (queue.length > 0) {
            const next = queue.shift()!
            next()
          }
        }
      }
      if (current < limit) {
        execute()
      } else {
        queue.push(execute)
      }
    })
  }

  return { run }
}

export async function uploadProxyMultipart(args: {
  uploadUrl: string
  providerId: string | null
  objectKey: string
  file: File
  contentType: string
  onProgress: (progress: number) => void
}): Promise<void> {
  const { uploadUrl, providerId, objectKey, file, contentType, onProgress } =
    args
  const partSize = computePartSize(file.size)
  const partCount = Math.ceil(file.size / partSize)

  // Initiate multipart upload
  const initiateResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Upload-Action': 'initiate',
    },
    body: JSON.stringify({
      objectKey,
      providerId,
      fileSize: file.size,
      contentType,
      partCount,
    }),
  })
  if (!initiateResponse.ok) {
    const errorBody = await readErrorBody(initiateResponse)
    throw new Error(
      `Proxy multipart init failed: HTTP ${initiateResponse.status} - ${errorBody}`,
    )
  }

  const data = await initiateResponse.json<{ uploadId: string }>()
  const uploadId = data.uploadId
  if (!uploadId) {
    throw new Error('Proxy multipart init did not return an upload id')
  }

  // Track per-part progress
  const loadedByPart = new Array<number>(partCount).fill(0)
  let totalLoaded = 0

  // Wrapper to upload a single part with progress tracking
  const uploadPart = async (partIndex: number): Promise<void> => {
    const partNumber = partIndex + 1
    const start = partIndex * partSize
    const end = Math.min(start + partSize, file.size)
    const chunk = file.slice(start, end)

    await uploadProxyPart({
      uploadUrl,
      providerId,
      objectKey,
      uploadId,
      partNumber,
      chunk,
      onPartProgress: (loadedBytes) => {
        totalLoaded += loadedBytes - loadedByPart[partIndex]
        loadedByPart[partIndex] = loadedBytes
        onProgress(Math.min(99, Math.round((totalLoaded / file.size) * 100)))
      },
    })
  }

  // Preemptive concurrency pool: start next part as soon as any slot frees up
  const semaphore = createSemaphore(PROXY_PART_CONCURRENCY)
  const partPromises = Array.from({ length: partCount }, (_, i) =>
    semaphore.run(() => uploadPart(i)),
  )

  await Promise.all(partPromises)

  // Complete the multipart upload
  const completeResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Upload-Action': 'complete',
    },
    body: JSON.stringify({ objectKey, providerId, uploadId }),
  })
  if (!completeResponse.ok) {
    const errorBody = await readErrorBody(completeResponse)
    throw new Error(
      `Proxy multipart complete failed: HTTP ${completeResponse.status} - ${errorBody}`,
    )
  }

  onProgress(100)
}
