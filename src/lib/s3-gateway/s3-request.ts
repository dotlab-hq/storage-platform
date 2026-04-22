export type ParsedS3Path = {
  bucketName: string | null
  objectKey: string | null
}

export type ParsedCopySource = {
  bucketName: string
  objectKey: string
}

const S3_BASE_PATH = '/api/storage/s3'

export function parseS3Path(requestUrl: string): ParsedS3Path {
  const url = new URL(requestUrl)
  const pathname = url.pathname

  if (pathname === S3_BASE_PATH || pathname === `${S3_BASE_PATH}/`) {
    return {
      bucketName: null,
      objectKey: null,
    }
  }

  if (!pathname.startsWith(`${S3_BASE_PATH}/`)) {
    return {
      bucketName: null,
      objectKey: null,
    }
  }

  const rest = pathname.slice(`${S3_BASE_PATH}/`.length)
  if (rest.length === 0) {
    return {
      bucketName: null,
      objectKey: null,
    }
  }

  const firstSlash = rest.indexOf('/')
  if (firstSlash === -1) {
    return {
      bucketName: decodeURIComponent(rest),
      objectKey: null,
    }
  }

  const bucketName = decodeURIComponent(rest.slice(0, firstSlash))
  const rawObjectKey = rest.slice(firstSlash + 1)
  const objectKey =
    rawObjectKey.length > 0 ? decodeURIComponent(rawObjectKey) : null

  return {
    bucketName,
    objectKey,
  }
}

export function hasMultipartCreateFlag(requestUrl: string): boolean {
  const url = new URL(requestUrl)
  return url.searchParams.has('uploads')
}

export function multipartUploadId(requestUrl: string): string | null {
  const url = new URL(requestUrl)
  const value = url.searchParams.get('uploadId')
  return value && value.length > 0 ? value : null
}

export function multipartPartNumber(requestUrl: string): number | null {
  const url = new URL(requestUrl)
  const value = url.searchParams.get('partNumber')
  if (!value) {
    return null
  }
  const parsed = Number(value)
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed
  }
  return null
}

export function listPrefix(requestUrl: string): string {
  const url = new URL(requestUrl)
  return url.searchParams.get('prefix') ?? ''
}

export function listDelimiter(requestUrl: string): string | null {
  const url = new URL(requestUrl)
  const delimiter = url.searchParams.get('delimiter')
  if (!delimiter || delimiter.length === 0) {
    return null
  }
  return delimiter
}

export function listTypeIsV2(requestUrl: string): boolean {
  const url = new URL(requestUrl)
  const listType = url.searchParams.get('list-type')
  return listType === null || listType === '2'
}

export function parseCopySource(headerValue: string): ParsedCopySource | null {
  const withoutQuery = headerValue.split('?')[0]
  const decoded = decodeURIComponent(withoutQuery).trim()
  const normalized = decoded.startsWith('/') ? decoded.slice(1) : decoded
  if (normalized.length === 0) {
    return null
  }

  const slashIndex = normalized.indexOf('/')
  if (slashIndex <= 0 || slashIndex >= normalized.length - 1) {
    return null
  }

  return {
    bucketName: normalized.slice(0, slashIndex),
    objectKey: normalized.slice(slashIndex + 1),
  }
}
