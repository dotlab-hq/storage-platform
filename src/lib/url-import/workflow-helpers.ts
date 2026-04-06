import type { UrlImportQueueMessage } from '@/lib/url-import/types'
import { writeJobRecord } from '@/lib/url-import/history'

export function inferFileName(
  url: string,
  savePath: string,
  contentType: string | null,
): string {
  if (savePath.includes('/')) {
    const segments = savePath.split('/').filter((segment) => segment.length > 0)
    const candidate = segments.at(-1)
    if (candidate) {
      return candidate
    }
  }

  const urlParts = url.split('/').filter((segment) => segment.length > 0)
  const fromUrl = urlParts.at(-1)
  if (fromUrl && fromUrl.includes('.')) {
    return decodeURIComponent(fromUrl)
  }

  if (contentType?.includes('json')) {
    return `${savePath}.json`
  }
  if (contentType?.includes('html')) {
    return `${savePath}.html`
  }
  return `${savePath}.bin`
}

export function buildCookieHeader(
  cookies: UrlImportQueueMessage['cookies'],
): string | null {
  if (cookies.length === 0) {
    return null
  }

  const segments = cookies.map(({ key, value }) => `${key}=${value}`)
  return segments.join('; ')
}

export async function markStatus(input: {
  kv: KVNamespace
  payload: UrlImportQueueMessage
  status: 'queued' | 'running' | 'failed' | 'completed'
  error: string | null
}): Promise<void> {
  await writeJobRecord({
    kv: input.kv,
    payload: input.payload,
    status: input.status,
    error: input.error,
  })
}
