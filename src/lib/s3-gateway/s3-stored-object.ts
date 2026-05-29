import { db } from '@/db'
import { file } from '@/db/schema/storage'
import type { BucketContext } from '@/lib/s3-gateway/s3-context'
import { and, eq, isNull } from 'drizzle-orm'
import { buildUpstreamObjectKey } from './upload-key-utils'
import { resolveVirtualFolderReadOnly, splitObjectKey } from './virtual-fs'

export type StoredObject = {
  objectKey: string
  providerId: string | null
  mimeType: string | null
  sizeInBytes: number
  etag: string | null
  cacheControl: string | null
  lastModified: Date | null
  updatedAt: Date
}

const SELECT_FIELDS = {
  objectKey: file.objectKey,
  providerId: file.providerId,
  mimeType: file.mimeType,
  sizeInBytes: file.sizeInBytes,
  etag: file.etag,
  cacheControl: file.cacheControl,
  lastModified: file.lastModified,
  updatedAt: file.updatedAt,
} as const

/**
 * Looks up a stored file record by the S3-style upstream object key.
 * Used for files uploaded via S3 PUT / WebDAV PUT which share the key format.
 */
async function findByUpstreamKey(
  bucket: BucketContext,
  objectKey: string,
): Promise<StoredObject | null> {
  const upstreamKey = buildUpstreamObjectKey(
    bucket.userId,
    bucket.bucketId,
    bucket.mappedFolderId,
    objectKey,
  )
  try {
    const rows = await db
      .select(SELECT_FIELDS)
      .from(file)
      .where(
        and(
          eq(file.userId, bucket.userId),
          eq(file.objectKey, upstreamKey),
          eq(file.isDeleted, false),
          eq(file.isTrashed, false),
        ),
      )
      .limit(1)
    return rows[0] ?? null
  } catch {
    return null
  }
}

/**
 * Fallback lookup by virtual folder path + file name.
 * UI-uploaded files are stored with UUID-prefixed objectKey but are indexed
 * by (folderId, name), so they can't be found by upstream key when accessed
 * via WebDAV using a virtual path like "documents/report.pdf".
 */
async function findByVirtualPath(
  bucket: BucketContext,
  objectKey: string,
): Promise<StoredObject | null> {
  const { folderPath, fileName, isDirectory } = splitObjectKey(objectKey)
  if (isDirectory || !fileName) return null

  let folderId: string | null
  try {
    const resolved = await resolveVirtualFolderReadOnly(
      bucket.userId,
      bucket.mappedFolderId,
      folderPath,
    )
    if (resolved === 'not_found') return null
    folderId = resolved
  } catch {
    return null
  }

  const rows = await db
    .select(SELECT_FIELDS)
    .from(file)
    .where(
      and(
        eq(file.userId, bucket.userId),
        folderId ? eq(file.folderId, folderId) : isNull(file.folderId),
        eq(file.name, fileName),
        eq(file.isDeleted, false),
        eq(file.isTrashed, false),
      ),
    )
    .limit(1)

  return rows[0] ?? null
}

/**
 * Resolves a virtual objectKey to a stored file record.
 * Tries upstream-key lookup first (S3/WebDAV PUT uploads), then falls back
 * to virtual-path resolution (UI uploads stored by folderId + name).
 */
export async function findStoredObject(
  bucket: BucketContext,
  objectKey: string,
): Promise<StoredObject | null> {
  const byKey = await findByUpstreamKey(bucket, objectKey)
  if (byKey) return byKey
  return findByVirtualPath(bucket, objectKey)
}
