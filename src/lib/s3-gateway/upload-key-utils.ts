export function buildUpstreamObjectKey(
  userId: string,
  bucketId: string,
  _folderId: string | null,
  objectKey: string,
): string {
  const normalizedSegments = objectKey
    .split('/')
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
  const normalizedObjectKey = normalizedSegments.join('/')
  return normalizedObjectKey.length > 0
    ? `s3/${userId}/${bucketId}/${normalizedObjectKey}`
    : `s3/${userId}/${bucketId}/__root__`
}

const UUID_PREFIX_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i

export function deriveFileName(objectKey: string): string {
  const pieces = objectKey.split('/').filter((value) => value.length > 0)
  const lastSegment = pieces[pieces.length - 1] ?? objectKey
  return lastSegment.replace(UUID_PREFIX_RE, '') || lastSegment
}
