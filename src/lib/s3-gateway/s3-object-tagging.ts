import { db } from '@/db'
import { fileTag } from '@/db/schema/s3-controls'
import { file } from '@/db/schema/storage'
import type { BucketContext } from '@/lib/s3-gateway/s3-context'
import { buildUpstreamObjectKey } from '@/lib/s3-gateway/upload-key-utils'
import { and, eq } from 'drizzle-orm'

export type ObjectTag = {
  key: string
  value: string
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function resolveKey(bucket: BucketContext, objectKey: string): string {
  return buildUpstreamObjectKey(
    bucket.userId,
    bucket.bucketId,
    bucket.mappedFolderId,
    objectKey,
  )
}

async function resolveFileId(
  bucket: BucketContext,
  objectKey: string,
): Promise<string | null> {
  const upstreamKey = resolveKey(bucket, objectKey)
  const rows = await db
    .select({ id: file.id })
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
  return rows[0]?.id ?? null
}

export async function getObjectTags(
  bucket: BucketContext,
  objectKey: string,
): Promise<ObjectTag[]> {
  const targetFileId = await resolveFileId(bucket, objectKey)
  if (!targetFileId) {
    return []
  }

  const rows = await db
    .select({ key: fileTag.tagKey, value: fileTag.tagValue })
    .from(fileTag)
    .where(eq(fileTag.fileId, targetFileId))

  return rows
}

export async function replaceObjectTags(
  bucket: BucketContext,
  objectKey: string,
  tags: ObjectTag[],
): Promise<void> {
  const targetFileId = await resolveFileId(bucket, objectKey)
  if (!targetFileId) {
    throw new Error('NoSuchKey')
  }

  await db.delete(fileTag).where(eq(fileTag.fileId, targetFileId))
  if (tags.length === 0) {
    return
  }

  await db.insert(fileTag).values(
    tags.map((tag) => ({
      fileId: targetFileId,
      tagKey: tag.key,
      tagValue: tag.value,
    })),
  )
}

export async function deleteObjectTags(
  bucket: BucketContext,
  objectKey: string,
): Promise<void> {
  const targetFileId = await resolveFileId(bucket, objectKey)
  if (!targetFileId) {
    return
  }
  await db.delete(fileTag).where(eq(fileTag.fileId, targetFileId))
}

export function objectTaggingXml(tags: ObjectTag[]): string {
  const tagXml = tags
    .map(
      (tag) =>
        `<Tag><Key>${escapeXml(tag.key)}</Key><Value>${escapeXml(tag.value)}</Value></Tag>`,
    )
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Tagging xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><TagSet>${tagXml}</TagSet></Tagging>`
}

export function parseObjectTaggingXml(xml: string): ObjectTag[] {
  const matches = [
    ...xml.matchAll(
      /<Tag>\s*<Key>\s*([^<]*)\s*<\/Key>\s*<Value>\s*([^<]*)\s*<\/Value>\s*<\/Tag>/gi,
    ),
  ]
  return matches.map((match) => ({
    key: match[1],
    value: match[2],
  }))
}
