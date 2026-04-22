type ListedVersion = {
  key: string
  versionId: string
  isDeleteMarker: boolean
  lastModified: Date
  etag: string | null
  size: number
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function listObjectVersionsXml(
  bucketName: string,
  versions: ListedVersion[],
): string {
  const entries = versions
    .map((item) => {
      if (item.isDeleteMarker) {
        return `<DeleteMarker><Key>${escapeXml(item.key)}</Key><VersionId>${escapeXml(item.versionId)}</VersionId><IsLatest>false</IsLatest><LastModified>${escapeXml(item.lastModified.toISOString())}</LastModified></DeleteMarker>`
      }
      return `<Version><Key>${escapeXml(item.key)}</Key><VersionId>${escapeXml(item.versionId)}</VersionId><IsLatest>false</IsLatest><LastModified>${escapeXml(item.lastModified.toISOString())}</LastModified><ETag>${escapeXml(item.etag ?? '')}</ETag><Size>${item.size}</Size><StorageClass>STANDARD</StorageClass></Version>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<ListVersionsResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Name>${escapeXml(bucketName)}</Name><IsTruncated>false</IsTruncated>${entries}</ListVersionsResult>`
}
