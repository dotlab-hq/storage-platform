export function buildUpstreamObjectKey(
  userId: string,
  bucketId: string,
  _folderId: string | null,
  _objectKey: string,
): string {
  const uuid = crypto.randomUUID()
  return `s3/${userId}/${bucketId}/${uuid}`
}

const UUID_PREFIX_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i

export function deriveFileName(objectKey: string): string {
  const pieces = objectKey.split('/').filter((value) => value.length > 0)
  const lastSegment = pieces[pieces.length - 1] ?? objectKey
  return lastSegment.replace(UUID_PREFIX_RE, '') || lastSegment
}
