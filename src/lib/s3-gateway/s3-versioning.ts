import {
  CopyObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { db } from '@/db'
import { fileVersion } from '@/db/schema/s3-controls'
import { virtualBucket } from '@/db/schema/s3-gateway'
import { file } from '@/db/schema/storage'
import type { BucketContext } from '@/lib/s3-gateway/s3-context'
import { getProviderClientById } from '@/lib/s3-provider-client'
import { and, desc, eq } from 'drizzle-orm'
import { buildUpstreamObjectKey } from '@/lib/s3-gateway/upload-key-utils'

function newVersionId(): string {
  return crypto.randomUUID().replaceAll('-', '')
}

function versionedObjectKey(baseKey: string, versionId: string): string {
  return `${baseKey}.__versions/${versionId}`
}

export async function getBucketVersioningState(
  bucketId: string,
): Promise<string> {
  const rows = await db
    .select({ state: virtualBucket.versioningState })
    .from(virtualBucket)
    .where(eq(virtualBucket.id, bucketId))
    .limit(1)
  return rows[0]?.state ?? 'disabled'
}

export async function createObjectVersionFromCurrent(
  bucket: BucketContext,
  objectKey: string,
  versionId?: string,
): Promise<string | null> {
  const targetVersionId = versionId ?? newVersionId()
  const upstreamObjectKey = buildUpstreamObjectKey(
    bucket.userId,
    bucket.bucketId,
    bucket.mappedFolderId,
    objectKey,
  )
  const rows = await db
    .select({
      fileId: file.id,
      objectKey: file.objectKey,
      providerId: file.providerId,
      sizeInBytes: file.sizeInBytes,
      mimeType: file.mimeType,
      etag: file.etag,
      userId: file.userId,
    })
    .from(file)
    .where(
      and(
        eq(file.userId, bucket.userId),
        eq(file.objectKey, upstreamObjectKey),
        eq(file.isDeleted, false),
      ),
    )
    .limit(1)

  if (rows.length === 0) {
    return null
  }
  const current = rows[0]

  const provider = await getProviderClientById(current.providerId)
  const archivedKey = versionedObjectKey(current.objectKey, targetVersionId)
  await provider.client.send(
    new CopyObjectCommand({
      Bucket: provider.bucketName,
      Key: archivedKey,
      CopySource: `/${provider.bucketName}/${current.objectKey}`,
    }),
  )

  await db.insert(fileVersion).values({
    bucketId: bucket.bucketId,
    fileId: current.fileId,
    objectKey,
    versionId: targetVersionId,
    isDeleteMarker: false,
    etag: current.etag,
    sizeInBytes: current.sizeInBytes,
    contentType: current.mimeType,
    storageProviderId: current.providerId,
    upstreamObjectKey: archivedKey,
    createdByUserId: bucket.userId,
  })

  return targetVersionId
}

export async function createDeleteMarkerVersion(
  bucket: BucketContext,
  objectKey: string,
): Promise<string> {
  const versionId = newVersionId()
  const upstreamObjectKey = buildUpstreamObjectKey(
    bucket.userId,
    bucket.bucketId,
    bucket.mappedFolderId,
    objectKey,
  )
  await db.insert(fileVersion).values({
    bucketId: bucket.bucketId,
    fileId: null,
    objectKey,
    versionId,
    isDeleteMarker: true,
    sizeInBytes: 0,
    createdByUserId: bucket.userId,
  })

  await db
    .update(file)
    .set({ isDeleted: true, deletedAt: new Date() })
    .where(
      and(
        eq(file.userId, bucket.userId),
        eq(file.objectKey, upstreamObjectKey),
        eq(file.isDeleted, false),
      ),
    )

  return versionId
}

export async function getObjectVersionResponse(
  bucket: BucketContext,
  objectKey: string,
  versionId: string,
  headOnly: boolean,
): Promise<Response | null> {
  const rows = await db
    .select({
      isDeleteMarker: fileVersion.isDeleteMarker,
      upstreamObjectKey: fileVersion.upstreamObjectKey,
      storageProviderId: fileVersion.storageProviderId,
      contentType: fileVersion.contentType,
      etag: fileVersion.etag,
      sizeInBytes: fileVersion.sizeInBytes,
      createdAt: fileVersion.createdAt,
    })
    .from(fileVersion)
    .where(
      and(
        eq(fileVersion.bucketId, bucket.bucketId),
        eq(fileVersion.objectKey, objectKey),
        eq(fileVersion.versionId, versionId),
      ),
    )
    .limit(1)

  if (rows.length === 0) {
    return null
  }
  const version = rows[0]
  if (version.isDeleteMarker || !version.upstreamObjectKey) {
    return null
  }

  const provider = await getProviderClientById(version.storageProviderId)
  const command = headOnly
    ? new HeadObjectCommand({
        Bucket: provider.bucketName,
        Key: version.upstreamObjectKey,
      })
    : new GetObjectCommand({
        Bucket: provider.bucketName,
        Key: version.upstreamObjectKey,
      })
  const result = await provider.client.send(command)

  const headers = new Headers()
  if (version.etag) headers.set('ETag', version.etag)
  headers.set('Last-Modified', version.createdAt.toUTCString())
  headers.set('x-amz-version-id', versionId)
  headers.set('Content-Type', version.contentType ?? 'application/octet-stream')
  headers.set('Content-Length', String(version.sizeInBytes))

  if (headOnly) {
    return new Response(null, { status: 200, headers })
  }
  const body = 'Body' in result ? (result.Body as BodyInit | null) : null
  return new Response(body, { status: 200, headers })
}

export async function listObjectVersions(bucketId: string): Promise<
  Array<{
    key: string
    versionId: string
    isDeleteMarker: boolean
    lastModified: Date
    etag: string | null
    size: number
  }>
> {
  const rows = await db
    .select({
      key: fileVersion.objectKey,
      versionId: fileVersion.versionId,
      isDeleteMarker: fileVersion.isDeleteMarker,
      lastModified: fileVersion.createdAt,
      etag: fileVersion.etag,
      size: fileVersion.sizeInBytes,
    })
    .from(fileVersion)
    .where(eq(fileVersion.bucketId, bucketId))
    .orderBy(fileVersion.objectKey, desc(fileVersion.createdAt))

  return rows
}

export async function restoreObjectVersion(
  bucket: BucketContext,
  objectKey: string,
  versionId: string,
): Promise<void> {
  const rows = await db
    .select({
      upstreamObjectKey: fileVersion.upstreamObjectKey,
      providerId: fileVersion.storageProviderId,
    })
    .from(fileVersion)
    .where(
      and(
        eq(fileVersion.bucketId, bucket.bucketId),
        eq(fileVersion.objectKey, objectKey),
        eq(fileVersion.versionId, versionId),
        eq(fileVersion.isDeleteMarker, false),
      ),
    )
    .limit(1)

  const version = rows.at(0)
  if (!version || !version.upstreamObjectKey) {
    throw new Error('NoSuchVersion')
  }

  const provider = await getProviderClientById(version.providerId)
  const currentKey = buildUpstreamObjectKey(
    bucket.userId,
    bucket.bucketId,
    bucket.mappedFolderId,
    objectKey,
  )
  await provider.client.send(
    new CopyObjectCommand({
      Bucket: provider.bucketName,
      Key: currentKey,
      CopySource: `/${provider.bucketName}/${version.upstreamObjectKey}`,
    }),
  )

  await db
    .update(file)
    .set({ isDeleted: false, deletedAt: null })
    .where(and(eq(file.userId, bucket.userId), eq(file.objectKey, currentKey)))
}
