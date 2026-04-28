import { Readable } from 'node:stream'
import { z } from 'zod'

export const ProxySingleHeadersSchema = z.object({
  objectKey: z.string().min(1),
  providerId: z.string().min(1).nullable(),
  fileSize: z.number().nonnegative(),
  contentType: z.string().min(1),
})

export const ProxyInitiateSchema = z.object({
  objectKey: z.string().min(1),
  providerId: z.string().min(1).nullable(),
  fileSize: z.number().nonnegative(),
  contentType: z.string().min(1),
  partCount: z.number().int().positive().max(10000),
})

export const ProxyPartHeadersSchema = z.object({
  objectKey: z.string().min(1),
  providerId: z.string().min(1).nullable(),
  uploadId: z.string().min(1),
  partNumber: z.number().int().positive().max(10000),
  partSize: z.number().int().positive().optional(),
})

export const ProxyCompleteSchema = z.object({
  objectKey: z.string().min(1),
  providerId: z.string().min(1).nullable(),
  uploadId: z.string().min(1),
})

// Download schemas
export const ProxyDownloadHeadersSchema = z.object({
  objectKey: z.string().min(1),
  providerId: z.string().min(1).nullable(),
})

export const ProxyDownloadRangeSchema = z.object({
  objectKey: z.string().min(1),
  providerId: z.string().min(1).nullable(),
  range: z.string().optional(),
})

async function* streamWebChunks(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<Uint8Array> {
  const reader = stream.getReader()
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) return
      if (value) yield value
    }
  } finally {
    reader.releaseLock()
  }
}

export function toNodeReadable(stream: ReadableStream<Uint8Array>): Readable {
  return Readable.from(streamWebChunks(stream))
}

export function parseProviderId(raw: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function parseMultipartAction(
  request: Request,
): 'single' | 'initiate' | 'part' | 'complete' {
  const action = (request.headers.get('x-upload-action') ?? 'single').trim()
  if (action === 'initiate' || action === 'part' || action === 'complete') {
    return action
  }
  return 'single'
}
