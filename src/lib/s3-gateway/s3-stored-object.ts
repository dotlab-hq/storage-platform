import { db } from '@/db'
import { file } from '@/db/schema/storage'
import type { BucketContext } from '@/lib/s3-gateway/s3-context'
import { and, eq } from 'drizzle-orm'
import { buildUpstreamObjectKey } from './upload-key-utils'

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

export async function findStoredObject(
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
      .select({
        objectKey: file.objectKey,
        providerId: file.providerId,
        mimeType: file.mimeType,
        sizeInBytes: file.sizeInBytes,
        etag: file.etag,
        cacheControl: file.cacheControl,
        lastModified: file.lastModified,
        updatedAt: file.updatedAt,
      })
      .from(file)
      .where(
        and(
          eq(file.userId, bucket.userId),
          eq(file.objectKey, upstreamKey),
          eq(file.isDeleted, false),
        ),
      )
      .limit(1)

    return rows[0] ?? null
  } catch (error) {
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : 'Unknown query error'
    console.warn(
      '[S3 Gateway] findStoredObject fell back to minimal file query due to schema mismatch:',
      message,
    )

    const fallbackRows = await db
      .select({
        objectKey: file.objectKey,
        providerId: file.providerId,
        mimeType: file.mimeType,
        sizeInBytes: file.sizeInBytes,
      })
      .from(file)
      .where(eq(file.objectKey, upstreamKey))
      .limit(1)

    const row = fallbackRows[0]
    if (!row) {
      return null
    }

    return {
      objectKey: row.objectKey,
      providerId: row.providerId,
      mimeType: row.mimeType,
      sizeInBytes: row.sizeInBytes,
      etag: null,
      cacheControl: null,
      lastModified: null,
      updatedAt: new Date(0),
    }
  }
}
