type ListedVersion = {
  key: string
  versionId: string
  isDeleteMarker: boolean
  isLatest: boolean
  lastModified: Date
  etag: string | null
  size: number
}

type VersionListing = {
  prefix: string
  keyMarker: string
  versionIdMarker: string
  maxKeys: number
  isTruncated: boolean
  nextKeyMarker: string | null
  nextVersionIdMarker: string | null
  versions: ListedVersion[]
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
  listing: VersionListing,
): string {
  const entries = listing.versions
    .map((item) => {
      if (item.isDeleteMarker) {
        return `<DeleteMarker><Key>${escapeXml(item.key)}</Key><VersionId>${escapeXml(item.versionId)}</VersionId><IsLatest>${item.isLatest}</IsLatest><LastModified>${escapeXml(item.lastModified.toISOString())}</LastModified></DeleteMarker>`
      }
      return `<Version><Key>${escapeXml(item.key)}</Key><VersionId>${escapeXml(item.versionId)}</VersionId><IsLatest>${item.isLatest}</IsLatest><LastModified>${escapeXml(item.lastModified.toISOString())}</LastModified><ETag>${escapeXml(item.etag ?? '')}</ETag><Size>${item.size}</Size><StorageClass>STANDARD</StorageClass></Version>`
    })
    .join('')

  const nextKeyMarker = listing.nextKeyMarker
    ? `<NextKeyMarker>${escapeXml(listing.nextKeyMarker)}</NextKeyMarker>`
    : ''
  const nextVersionIdMarker = listing.nextVersionIdMarker
    ? `<NextVersionIdMarker>${escapeXml(listing.nextVersionIdMarker)}</NextVersionIdMarker>`
    : ''

  return `<?xml version="1.0" encoding="UTF-8"?>\n<ListVersionsResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Name>${escapeXml(bucketName)}</Name><Prefix>${escapeXml(listing.prefix)}</Prefix><KeyMarker>${escapeXml(listing.keyMarker)}</KeyMarker><VersionIdMarker>${escapeXml(listing.versionIdMarker)}</VersionIdMarker><MaxKeys>${listing.maxKeys}</MaxKeys><IsTruncated>${listing.isTruncated}</IsTruncated>${nextKeyMarker}${nextVersionIdMarker}${entries}</ListVersionsResult>`
}
