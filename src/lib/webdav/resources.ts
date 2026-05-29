import {
  resolveBucketByName,
  type BucketContext,
} from '@/lib/s3-gateway/s3-context'
import {
  headObject,
  listObjectsV2,
} from '@/lib/s3-gateway/s3-object-store'
import type { WebDavPath } from '@/lib/webdav/path'
import { collectionKey } from '@/lib/webdav/path'
import type { WebDavPrincipal } from '@/lib/webdav/auth'
import { assertBucketPrincipal } from '@/lib/webdav/auth'

export type WebDavResource = {
  bucket: BucketContext | null
  bucketName: string | null
  objectKey: string | null
  href: string
  displayName: string
  isCollection: boolean
  exists: boolean
  size: number
  etag: string | null
  contentType: string
  createdAt: Date
  lastModified: Date
}

export type ResolvedDavTarget =
  | { ok: true; bucket: BucketContext | null }
  | { ok: false; response: Response }

export async function resolveDavBucket(
  principal: WebDavPrincipal,
  bucketName: string | null,
): Promise<ResolvedDavTarget> {
  if (!bucketName) return { ok: true, bucket: null }
  const bucket = await resolveBucketByName(bucketName)
  if (!bucket) {
    return { ok: false, response: new Response('Bucket not found', { status: 404 }) }
  }
  if (!assertBucketPrincipal(principal, bucket)) {
    return { ok: false, response: new Response('Access denied', { status: 403 }) }
  }
  return { ok: true, bucket }
}

function displayNameFor(path: WebDavPath): string {
  if (!path.bucketName) return 'webdav'
  if (!path.objectKey) return path.bucketName
  const trimmed = path.objectKey.replace(/\/+$/, '')
  return trimmed.split('/').pop() ?? path.bucketName
}

function headerDate(value: string | null): Date {
  if (!value) return new Date(0)
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}

function etagFromHead(response: Response): string | null {
  return response.headers.get('etag')
}

export async function resourceFromPath(input: {
  path: WebDavPath
  href: string
  principal: WebDavPrincipal
}): Promise<WebDavResource | Response> {
  const resolved = await resolveDavBucket(input.principal, input.path.bucketName)
  if (!resolved.ok) return resolved.response
  const bucket = resolved.bucket

  if (!bucket) {
    return {
      bucket: null,
      bucketName: null,
      objectKey: null,
      href: input.href,
      displayName: 'webdav',
      isCollection: true,
      exists: true,
      size: 0,
      etag: null,
      contentType: 'httpd/unix-directory',
      createdAt: new Date(0),
      lastModified: new Date(),
    }
  }

  if (!input.path.objectKey) {
    return {
      bucket,
      bucketName: bucket.bucketName,
      objectKey: null,
      href: input.href,
      displayName: bucket.bucketName,
      isCollection: true,
      exists: true,
      size: 0,
      etag: null,
      contentType: 'httpd/unix-directory',
      createdAt: bucket.createdAt,
      lastModified: bucket.createdAt,
    }
  }

  const objectKey = input.path.objectKey
  const head = await headObject(bucket, objectKey, {
    ifNoneMatch: null,
    ifModifiedSince: null,
  })
  if (head?.status === 200) {
    return {
      bucket,
      bucketName: bucket.bucketName,
      objectKey,
      href: input.href,
      displayName: displayNameFor(input.path),
      isCollection: objectKey.endsWith('/'),
      exists: true,
      size: Number.parseInt(head.headers.get('content-length') ?? '0', 10),
      etag: etagFromHead(head),
      contentType: head.headers.get('content-type') ?? 'application/octet-stream',
      createdAt: headerDate(head.headers.get('last-modified')),
      lastModified: headerDate(head.headers.get('last-modified')),
    }
  }

  const prefix = collectionKey(objectKey)
  const children = await listObjectsV2(bucket, prefix)
  if (children.length > 0) {
    return {
      bucket,
      bucketName: bucket.bucketName,
      objectKey: prefix,
      href: input.href,
      displayName: displayNameFor(input.path),
      isCollection: true,
      exists: true,
      size: 0,
      etag: null,
      contentType: 'httpd/unix-directory',
      createdAt: new Date(0),
    lastModified: children[0]?.lastModified ?? new Date(0),
    }
  }

  return new Response('Not found', { status: 404 })
}
