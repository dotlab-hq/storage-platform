import { listVirtualBuckets } from '@/lib/s3-gateway/virtual-buckets.queries.server'
import {
  listObjectsV2,
  type ListedS3Object,
} from '@/lib/s3-gateway/s3-object-store'
import type { BucketContext } from '@/lib/s3-gateway/s3-context'
import type { WebDavPrincipal } from '@/lib/webdav/auth'
import { collectionKey } from '@/lib/webdav/path'
import type { WebDavResource } from '@/lib/webdav/resources'
import { mimeTypeForKey } from '@/lib/webdav/mime'

function immediateChildren(
  objects: ListedS3Object[],
  prefix: string,
): Array<{ key: string; isCollection: boolean; item: ListedS3Object }> {
  const seen = new Set<string>()
  const children: Array<{
    key: string
    isCollection: boolean
    item: ListedS3Object
  }> = []
  for (const item of objects) {
    const relative = item.key.startsWith(prefix)
      ? item.key.slice(prefix.length)
      : item.key
    if (relative.length === 0) continue
    const slash = relative.indexOf('/')
    const key =
      slash === -1 ? item.key : `${prefix}${relative.slice(0, slash + 1)}`
    if (seen.has(key)) continue
    seen.add(key)
    children.push({
      key,
      isCollection: slash !== -1 || key.endsWith('/'),
      item,
    })
  }
  return children
}

function encodeKeyHref(bucketName: string, key: string): string {
  return `/api/storage/webdav/${encodeURIComponent(bucketName)}/${key
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')}`
}

export async function listDavChildren(input: {
  principal: WebDavPrincipal
  bucket: BucketContext | null
  objectKey: string | null
}): Promise<WebDavResource[]> {
  if (!input.bucket) {
    const buckets = await listVirtualBuckets(input.principal.userId)
    return buckets.map((bucket) => ({
      bucket: null,
      bucketName: bucket.name,
      objectKey: null,
      href: `/api/storage/webdav/${encodeURIComponent(bucket.name)}/`,
      displayName: bucket.name,
      isCollection: true,
      exists: true,
      size: 0,
      etag: null,
      contentType: 'httpd/unix-directory',
      createdAt: bucket.createdAt ? new Date(bucket.createdAt) : new Date(0),
      lastModified: bucket.createdAt ? new Date(bucket.createdAt) : new Date(0),
    }))
  }

  const bucket = input.bucket
  const prefix = input.objectKey ? collectionKey(input.objectKey) : ''
  const objects = await listObjectsV2(bucket, prefix)
  return immediateChildren(objects, prefix).map(
    ({ key, isCollection, item }) => ({
      bucket,
      bucketName: bucket.bucketName,
      objectKey: key,
      href: encodeKeyHref(bucket.bucketName, key),
      displayName: key.replace(/\/+$/, '').split('/').pop() ?? key,
      isCollection,
      exists: true,
      size: isCollection ? 0 : item.size,
      etag: isCollection ? null : item.eTag,
      contentType: isCollection
        ? 'httpd/unix-directory'
        : mimeTypeForKey(key, item.mimeType),
      createdAt: item.lastModified,
      lastModified: item.lastModified,
    }),
  )
}
