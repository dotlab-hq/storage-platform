// @ts-nocheck
import { readErrorBody } from '@/lib/upload-proxy-client-shared'

export async function uploadProxySingle(args: {
  uploadUrl: string
  providerId: string | null
  objectKey: string
  file: File
  contentType: string
  onProgress: (progress: number) => void
}): Promise<void> {
  const { uploadUrl, providerId, objectKey, file, contentType, onProgress } =
    args
  const total = file.size
  let loaded = 0

  const progressTransform = new TransformStream({
    transform(chunk: Uint8Array, controller) {
      loaded += chunk.byteLength
      onProgress(Math.min(99, Math.round((loaded / total) * 100)))
      controller.enqueue(chunk)
    },
  })

  const bodyStream = file.stream().pipeThrough(progressTransform)
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      'X-Upload-Object-Key': objectKey,
      'X-Upload-File-Size': String(file.size),
      'X-Upload-Provider-Id': providerId ?? '',
    },
    body: bodyStream,
    duplex: 'half',
  })

  if (!response.ok) {
    const errorBody = await readErrorBody(response)
    throw new Error(
      `Proxy upload failed: HTTP ${response.status} - ${errorBody}`,
    )
  }

  onProgress(100)
}
