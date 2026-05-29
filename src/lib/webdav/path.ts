export type WebDavPath = {
  bucketName: string | null
  objectKey: string | null
  isRoot: boolean
}

const WEBDAV_BASE_PATH = '/api/storage/webdav'

function decodeSegment(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function normalizeObjectKey(value: string): string {
  return value.replaceAll('\\', '/').replace(/^\/+/, '')
}

export function parseWebDavPath(requestUrl: string): WebDavPath {
  const url = new URL(requestUrl)
  const pathname = url.pathname
  if (pathname === WEBDAV_BASE_PATH || pathname === `${WEBDAV_BASE_PATH}/`) {
    return { bucketName: null, objectKey: null, isRoot: true }
  }

  if (!pathname.startsWith(`${WEBDAV_BASE_PATH}/`)) {
    return { bucketName: null, objectKey: null, isRoot: true }
  }

  const rest = pathname.slice(`${WEBDAV_BASE_PATH}/`.length)
  const slash = rest.indexOf('/')
  if (slash === -1) {
    return {
      bucketName: decodeSegment(rest),
      objectKey: null,
      isRoot: false,
    }
  }

  return {
    bucketName: decodeSegment(rest.slice(0, slash)),
    objectKey: normalizeObjectKey(decodeSegment(rest.slice(slash + 1))),
    isRoot: false,
  }
}

function encodePathPart(value: string): string {
  return value
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
}

export function webDavHref(bucketName: string | null, objectKey: string | null) {
  if (!bucketName) return `${WEBDAV_BASE_PATH}/`
  const bucket = encodeURIComponent(bucketName)
  if (!objectKey) return `${WEBDAV_BASE_PATH}/${bucket}/`
  return `${WEBDAV_BASE_PATH}/${bucket}/${encodePathPart(objectKey)}`
}

export function collectionKey(value: string): string {
  const normalized = normalizeObjectKey(value).replace(/\/+$/, '')
  return normalized.length === 0 ? '' : `${normalized}/`
}

export function parseDestinationPath(
  requestUrl: string,
  destination: string | null,
): WebDavPath | null {
  if (!destination) return null
  const request = new URL(requestUrl)
  const destinationUrl = new URL(destination, request.origin)
  if (destinationUrl.origin !== request.origin) return null
  return parseWebDavPath(destinationUrl.toString())
}

export function getParentKey(objectKey: string): string {
  const normalized = objectKey.replace(/\/+$/, '')
  const lastSlash = normalized.lastIndexOf('/')
  if (lastSlash === -1) {
    return ''
  }
  return normalized.substring(0, lastSlash)
}
