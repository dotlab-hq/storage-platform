export type ObjectPayload = {
  properties: {
    name: string
    sizeInBytes: number
    mimeType: string | null
    etag: string | null
    lastModified?: string | null
    storageClass?: string | null
  }
  tags: Array<{ key: string; value: string }>
  acl: 'private' | 'public-read'
  versions: Array<{
    versionId: string
    isDeleteMarker: boolean
    createdAt: string
    etag: string | null
    sizeInBytes: number
  }>
}
