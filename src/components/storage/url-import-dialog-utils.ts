import type { KeyValue } from '@/components/storage/url-import-dialog-types'

export function parsePairs(raw: string): KeyValue[] {
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  return lines
    .map((line) => {
      const separatorIndex = line.indexOf(':')
      if (separatorIndex <= 0) {
        return null
      }
      return {
        key: line.slice(0, separatorIndex).trim(),
        value: line.slice(separatorIndex + 1).trim(),
      }
    })
    .filter((entry): entry is KeyValue => entry !== null)
}

export async function validateUrlByHead(url: string): Promise<{
  ok: boolean
  message: string
}> {
  if (!url.trim()) {
    return { ok: false, message: 'URL is required.' }
  }

  try {
    const response = await fetch(url.trim(), { method: 'HEAD' })
    if (!response.ok) {
      return {
        ok: false,
        message: `URL check failed with status ${response.status}`,
      }
    }

    const contentType = response.headers.get('content-type') ?? 'unknown'
    return {
      ok: true,
      message: `Reachable. content-type: ${contentType}`,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'URL validation failed',
    }
  }
}
