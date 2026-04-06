type CachedObjectPayload = {
  body: Uint8Array
  contentType: string
  contentLength: number
  eTag: string | null
  lastModified: Date | null
  cacheControl: string
  expiresAt: number
}

type CachedObjectMeta = {
  contentType: string
  contentLength: number
  eTag: string | null
  lastModified: Date | null
  cacheControl: string
}

type CacheGlobal = typeof globalThis & {
  __s3GetObjectCache__?: Map<string, CachedObjectPayload>
}

const SHORT_OBJECT_CACHE_TTL_MS = 30_000
const MAX_CACHEABLE_OBJECT_BYTES = 5 * 1024 * 1024
const MAX_CACHE_ENTRIES = 100

function objectCacheStore(): Map<string, CachedObjectPayload> {
  const globals = globalThis as CacheGlobal
  if (!globals.__s3GetObjectCache__) {
    globals.__s3GetObjectCache__ = new Map<string, CachedObjectPayload>()
  }
  return globals.__s3GetObjectCache__
}

function trimCache(store: Map<string, CachedObjectPayload>): void {
  while (store.size > MAX_CACHE_ENTRIES) {
    const oldestKey = store.keys().next().value
    if (!oldestKey) {
      return
    }
    store.delete(oldestKey)
  }
}

export function getS3ObjectCacheKey(
  bucketId: string,
  objectKey: string,
): string {
  return `${bucketId}:${objectKey}`
}

export function resolveShortObjectCacheControl(): string {
  return 'public, max-age=30, stale-while-revalidate=30'
}

export function getCachedS3Object(
  cacheKey: string,
): CachedObjectPayload | null {
  const store = objectCacheStore()
  const payload = store.get(cacheKey)
  if (!payload) {
    return null
  }
  if (payload.expiresAt <= Date.now()) {
    store.delete(cacheKey)
    return null
  }
  return payload
}

export function deleteCachedS3Object(cacheKey: string): void {
  objectCacheStore().delete(cacheKey)
}

export async function cacheS3ObjectFromStream(input: {
  cacheKey: string
  stream: ReadableStream<Uint8Array>
  meta: CachedObjectMeta
}): Promise<void> {
  const bytes = await streamToBytesWithinLimit(input.stream)
  if (!bytes) {
    return
  }
  if (bytes.byteLength > MAX_CACHEABLE_OBJECT_BYTES) {
    return
  }
  const payload: CachedObjectPayload = {
    body: bytes,
    contentType: input.meta.contentType,
    contentLength: input.meta.contentLength,
    eTag: input.meta.eTag,
    lastModified: input.meta.lastModified,
    cacheControl: input.meta.cacheControl,
    expiresAt: Date.now() + SHORT_OBJECT_CACHE_TTL_MS,
  }
  const store = objectCacheStore()
  store.set(input.cacheKey, payload)
  trimCache(store)
}

function canCacheByLength(contentLength: number): boolean {
  return (
    Number.isFinite(contentLength) &&
    contentLength > 0 &&
    contentLength <= MAX_CACHEABLE_OBJECT_BYTES
  )
}

async function streamToBytesWithinLimit(
  stream: ReadableStream<Uint8Array>,
): Promise<Uint8Array | null> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    for (;;) {
      const next = await reader.read()
      if (next.done) {
        break
      }
      totalBytes += next.value.byteLength
      if (!canCacheByLength(totalBytes)) {
        await reader.cancel('object exceeds cache size limit')
        return null
      }
      chunks.push(next.value)
    }
  } finally {
    reader.releaseLock()
  }

  const output = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.byteLength
  }
  return output
}
