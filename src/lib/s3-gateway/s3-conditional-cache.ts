export type ObjectConditionalHeaders = {
  ifNoneMatch: string | null
  ifModifiedSince: string | null
}

type StatusMetadataError = {
  $metadata?: {
    httpStatusCode?: number
  }
}

export function isStatusMetadataError(
  error: unknown,
): error is StatusMetadataError {
  if (typeof error !== 'object' || !error) return false
  if (!('$metadata' in error)) return false
  const withMetadata = error as StatusMetadataError
  return (
    typeof withMetadata.$metadata === 'object' ||
    typeof withMetadata.$metadata === 'undefined'
  )
}

export function normalizeETag(value: string): string {
  return value
    .trim()
    .replace(/^W\//, '')
    .replace(/^"(.*)"$/, '$1')
}

function etagMatches(expected: string, providedList: string): boolean {
  const normalizedExpected = normalizeETag(expected)
  const tokens = providedList
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (tokens.includes('*')) return true
  return tokens.some((token) => normalizeETag(token) === normalizedExpected)
}

export function shouldReturnNotModified(input: {
  eTag: string | null
  lastModified: Date | null
  ifNoneMatch: string | null
  ifModifiedSince: string | null
}): boolean {
  if (input.ifNoneMatch && input.eTag) {
    return etagMatches(input.eTag, input.ifNoneMatch)
  }
  if (input.ifModifiedSince && input.lastModified) {
    const since = parseHttpDate(input.ifModifiedSince)
    if (!since) return false
    return input.lastModified.getTime() <= since.getTime()
  }
  return false
}

export function buildCacheHeaders(input: {
  eTag: string | null | undefined
  lastModified: Date | undefined
  cacheControl: string | null | undefined
  includeDefaultCacheControl?: boolean
}): Headers {
  const headers = new Headers()
  if (input.eTag) {
    headers.set('ETag', `"${normalizeETag(input.eTag)}"`)
  }
  if (input.cacheControl) {
    headers.set('Cache-Control', input.cacheControl)
  } else if (input.includeDefaultCacheControl !== false) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  if (input.lastModified) {
    headers.set('Last-Modified', input.lastModified.toUTCString())
  }
  return headers
}

export function parseHttpDate(value: string | null): Date | undefined {
  if (!value) return undefined
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return undefined
  return new Date(parsed)
}
