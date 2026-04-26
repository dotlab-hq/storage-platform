const XML_CONTENT_TYPE = 'application/xml'

function escapeXml(value: string): string {
  const sanitized = value.replace(
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
    '',
  )
  return sanitized
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function xmlResponse(
  body: string,
  status = 200,
  headers?: HeadersInit,
): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': XML_CONTENT_TYPE,
      ...headers,
    },
  })
}

export function s3ErrorResponse(
  status: number,
  code: string,
  message: string,
  resource: string,
): Response {
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<Error><Code>${escapeXml(code)}</Code><Message>${escapeXml(message)}</Message><Resource>${escapeXml(resource)}</Resource></Error>`
  return xmlResponse(body, status)
}

export function listBucketsXml(
  buckets: Array<{ name: string; createdAt: Date }>,
): string {
  const bucketEntries = buckets
    .map(
      (bucket) =>
        `<Bucket><Name>${escapeXml(bucket.name)}</Name><CreationDate>${escapeXml(bucket.createdAt.toISOString())}</CreationDate></Bucket>`,
    )
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<ListAllMyBucketsResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Buckets>${bucketEntries}</Buckets></ListAllMyBucketsResult>`
}

export type S3ObjectItem = {
  key: string
  size: number
  eTag: string | null
  lastModified: Date
}

type ListObjectsXmlOptions = {
  delimiter?: string | null
  commonPrefixes?: string[]
  maxKeys?: number
  isTruncated?: boolean
  nextContinuationToken?: string | null
  marker?: string | null
  nextMarker?: string | null
}

function commonPrefixesXml(prefixes: string[]): string {
  return prefixes
    .map(
      (value) =>
        `<CommonPrefixes><Prefix>${escapeXml(value)}</Prefix></CommonPrefixes>`,
    )
    .join('')
}

export function listObjectsV2Xml(
  bucketName: string,
  prefix: string,
  items: S3ObjectItem[],
  options?: ListObjectsXmlOptions,
): string {
  const contents = items
    .map(
      (item) =>
        `<Contents><Key>${escapeXml(item.key)}</Key><LastModified>${escapeXml(item.lastModified.toISOString())}</LastModified><ETag>${escapeXml(item.eTag ?? '')}</ETag><Size>${item.size}</Size><StorageClass>STANDARD</StorageClass></Contents>`,
    )
    .join('')
  const delimiterTag = options?.delimiter
    ? `<Delimiter>${escapeXml(options.delimiter)}</Delimiter>`
    : ''
  const commonPrefixes = commonPrefixesXml(options?.commonPrefixes ?? [])
  const keyCount = items.length + (options?.commonPrefixes?.length ?? 0)
  const maxKeys = options?.maxKeys ?? 1000
  const isTruncated = options?.isTruncated ?? false
  const nextContinuationToken = options?.nextContinuationToken
    ? `<NextContinuationToken>${escapeXml(options.nextContinuationToken)}</NextContinuationToken>`
    : ''

  return `<?xml version="1.0" encoding="UTF-8"?>\n<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Name>${escapeXml(bucketName)}</Name><Prefix>${escapeXml(prefix)}</Prefix>${delimiterTag}<KeyCount>${keyCount}</KeyCount><MaxKeys>${maxKeys}</MaxKeys><IsTruncated>${isTruncated}</IsTruncated>${nextContinuationToken}${commonPrefixes}${contents}</ListBucketResult>`
}

export function listObjectsXml(
  bucketName: string,
  prefix: string,
  marker: string,
  items: S3ObjectItem[],
  options?: ListObjectsXmlOptions,
): string {
  const contents = items
    .map(
      (item) =>
        `<Contents><Key>${escapeXml(item.key)}</Key><LastModified>${escapeXml(item.lastModified.toISOString())}</LastModified><ETag>${escapeXml(item.eTag ?? '')}</ETag><Size>${item.size}</Size><StorageClass>STANDARD</StorageClass></Contents>`,
    )
    .join('')
  const delimiterTag = options?.delimiter
    ? `<Delimiter>${escapeXml(options.delimiter)}</Delimiter>`
    : ''
  const commonPrefixes = commonPrefixesXml(options?.commonPrefixes ?? [])
  const maxKeys = options?.maxKeys ?? 1000
  const isTruncated = options?.isTruncated ?? false
  const nextMarker =
    options?.nextMarker && options.nextMarker.length > 0
      ? `<NextMarker>${escapeXml(options.nextMarker)}</NextMarker>`
      : ''

  return `<?xml version="1.0" encoding="UTF-8"?>\n<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Name>${escapeXml(bucketName)}</Name><Prefix>${escapeXml(prefix)}</Prefix><Marker>${escapeXml(marker)}</Marker>${delimiterTag}<MaxKeys>${maxKeys}</MaxKeys><IsTruncated>${isTruncated}</IsTruncated>${nextMarker}${commonPrefixes}${contents}</ListBucketResult>`
}

export function createMultipartUploadXml(
  bucketName: string,
  key: string,
  uploadId: string,
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<InitiateMultipartUploadResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Bucket>${escapeXml(bucketName)}</Bucket><Key>${escapeXml(key)}</Key><UploadId>${escapeXml(uploadId)}</UploadId></InitiateMultipartUploadResult>`
}

export function completeMultipartUploadXml(
  bucketName: string,
  key: string,
  eTag: string,
  versionId: string | null = null,
): string {
  const versionTag = versionId
    ? `<VersionId>${escapeXml(versionId)}</VersionId>`
    : ''
  return `<?xml version="1.0" encoding="UTF-8"?>\n<CompleteMultipartUploadResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Location></Location><Bucket>${escapeXml(bucketName)}</Bucket><Key>${escapeXml(key)}</Key><ETag>${escapeXml(eTag)}</ETag>${versionTag}</CompleteMultipartUploadResult>`
}

export function copyObjectXml(
  eTag: string,
  lastModified: Date,
  versionId: string | null = null,
): string {
  const versionTag = versionId
    ? `<VersionId>${escapeXml(versionId)}</VersionId>`
    : ''
  return `<?xml version="1.0" encoding="UTF-8"?>\n<CopyObjectResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><LastModified>${escapeXml(lastModified.toISOString())}</LastModified><ETag>${escapeXml(eTag)}</ETag>${versionTag}</CopyObjectResult>`
}
