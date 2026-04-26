import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { fileVersion } from '@/db/schema/s3-controls'
import { virtualBucket } from '@/db/schema/s3-gateway'
import { file } from '@/db/schema/storage'
import type { BucketContext } from '@/lib/s3-gateway/s3-context'
import { getProviderClientById } from '@/lib/s3-provider-client'
import { buildUpstreamObjectKey } from '@/lib/s3-gateway/upload-key-utils'

type VersioningState = 'enabled' | 'suspended' | 'disabled'

type VersionListOptions = {
  prefix: string
  keyMarker: string | null
  versionIdMarker: string | null
  maxKeys: number
}

type VersionListRow = {
  key: string
  versionId: string
  isDeleteMarker: boolean
  lastModified: Date
  etag: string | null
  size: number
}

export type ListedVersionResponse = {
  prefix: string
  keyMarker: string
  versionIdMarker: string
  maxKeys: number
  isTruncated: boolean
  nextKeyMarker: string | null
  nextVersionIdMarker: string | null
  versions: Array<VersionListRow & { isLatest: boolean }>
}

function newVersionId(): string {
  return crypto.randomUUID().replaceAll('-', '')
}

function versionedObjectKey(baseKey: string, versionId: string): string {
  return `${baseKey}.__versions/${versionId}`
}

function compareVersionRows(
  left: VersionListRow,
  right: VersionListRow,
): number {
  if (left.key === right.key) {
    return right.lastModified.getTime() - left.lastModified.getTime()
  }
  return left.key.localeCompare(right.key)
}

function normalizeOptions(
  options: Partial<VersionListOptions>,
): VersionListOptions {
  const max = options.maxKeys ?? 1000
  return {
    prefix: options.prefix ?? '',
    keyMarker: options.keyMarker ?? null,
    versionIdMarker: options.versionIdMarker ?? null,
    maxKeys: Math.max(0, Math.min(max, 1000)),
  }
}

export async function getBucketVersioningState(
  bucketId: string,
): Promise<VersioningState> {
  const rows = await db
    .select({ state: virtualBucket.versioningState })
    .from(virtualBucket)
    .where(eq(virtualBucket.id, bucketId))
    .limit(1)
  const raw = rows[0]?.state
  if (raw === 'enabled' || raw === 'suspended' || raw === 'disabled') {
    return raw
  }
  return 'disabled'
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

  if (!rows[0]) {
    return null
  }

  const current = rows[0]
  const provider = await getProviderClientById(current.providerId)
  let storedVersionObjectKey: string | null = current.objectKey

  if (targetVersionId !== 'null') {
    const archivedKey = versionedObjectKey(current.objectKey, targetVersionId)
    await provider.client.send(
      new CopyObjectCommand({
        Bucket: provider.bucketName,
        Key: archivedKey,
        CopySource: `/${provider.bucketName}/${current.objectKey}`,
      }),
    )
    storedVersionObjectKey = archivedKey
  }

  await db
    .insert(fileVersion)
    .values({
      bucketId: bucket.bucketId,
      fileId: current.fileId,
      objectKey,
      versionId: targetVersionId,
      isDeleteMarker: false,
      etag: current.etag,
      sizeInBytes: current.sizeInBytes,
      contentType: current.mimeType,
      storageProviderId: current.providerId,
      upstreamObjectKey: storedVersionObjectKey,
      createdByUserId: bucket.userId,
    })
    .onConflictDoUpdate({
      target: [
        fileVersion.bucketId,
        fileVersion.objectKey,
        fileVersion.versionId,
      ],
      set: {
        fileId: current.fileId,
        isDeleteMarker: false,
        etag: current.etag,
        sizeInBytes: current.sizeInBytes,
        contentType: current.mimeType,
        storageProviderId: current.providerId,
        upstreamObjectKey: storedVersionObjectKey,
        createdByUserId: bucket.userId,
        createdAt: new Date(),
      },
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

export async function getResponseVersionIdForCurrentObject(
  bucket: BucketContext,
  objectKey: string,
): Promise<string | null> {
  const state = await getBucketVersioningState(bucket.bucketId)
  if (state === 'disabled') {
    return null
  }
  if (state === 'suspended') {
    return 'null'
  }

  const rows = await db
    .select({ versionId: fileVersion.versionId })
    .from(fileVersion)
    .where(
      and(
        eq(fileVersion.bucketId, bucket.bucketId),
        eq(fileVersion.objectKey, objectKey),
        eq(fileVersion.isDeleteMarker, false),
      ),
    )
    .orderBy(desc(fileVersion.createdAt))
    .limit(1)
  return rows[0]?.versionId ?? 'null'
}

export async function getObjectVersionResponse(
  bucket: BucketContext,
  objectKey: string,
  versionId: string,
  headOnly: boolean,
): Promise<Response | null> {
  const isNullVersion = versionId === 'null'
  if (isNullVersion) {
    const upstreamObjectKey = buildUpstreamObjectKey(
      bucket.userId,
      bucket.bucketId,
      bucket.mappedFolderId,
      objectKey,
    )
    const rows = await db
      .select({ providerId: file.providerId })
      .from(file)
      .where(
        and(
          eq(file.userId, bucket.userId),
          eq(file.objectKey, upstreamObjectKey),
          eq(file.isDeleted, false),
        ),
      )
      .limit(1)
    if (!rows[0]) {
      return null
    }
    const provider = await getProviderClientById(rows[0].providerId)
    const command = headOnly
      ? new HeadObjectCommand({
          Bucket: provider.bucketName,
          Key: upstreamObjectKey,
        })
      : new GetObjectCommand({
          Bucket: provider.bucketName,
          Key: upstreamObjectKey,
        })
    const result = await provider.client.send(command)
    const headers = new Headers()
    headers.set('x-amz-version-id', 'null')
    headers.set(
      'Content-Type',
      result.ContentType ?? 'application/octet-stream',
    )
    headers.set('Content-Length', String(result.ContentLength ?? 0))
    if (result.ETag) headers.set('ETag', result.ETag)
    if (result.LastModified) {
      headers.set('Last-Modified', result.LastModified.toUTCString())
    }
    return headOnly
      ? new Response(null, { status: 200, headers })
      : new Response(
          'Body' in result ? (result.Body as BodyInit | null) : null,
          {
            status: 200,
            headers,
          },
        )
  }

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

  const version = rows[0]
  if (!version || version.isDeleteMarker || !version.upstreamObjectKey) {
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

export async function listObjectVersions(
  bucketId: string,
  options: Partial<VersionListOptions> = {},
): Promise<ListedVersionResponse> {
  const normalized = normalizeOptions(options)
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

  const filteredByPrefix = rows
    .filter((row) => row.key.startsWith(normalized.prefix))
    .sort(compareVersionRows)

  const markerFiltered = normalized.keyMarker
    ? filteredByPrefix.filter((row) => {
        if (row.key > normalized.keyMarker!) return true
        if (row.key < normalized.keyMarker!) return false
        if (!normalized.versionIdMarker) return false
        return row.versionId < normalized.versionIdMarker
      })
    : filteredByPrefix

  const page = markerFiltered.slice(0, normalized.maxKeys)
  const remainder = markerFiltered.slice(normalized.maxKeys)
  const latestByKey = new Set<string>()
  const versionsWithLatest = page.map((item) => {
    const isLatest = !latestByKey.has(item.key)
    latestByKey.add(item.key)
    return { ...item, isLatest }
  })
  const next = remainder[0] ?? null

  return {
    prefix: normalized.prefix,
    keyMarker: normalized.keyMarker ?? '',
    versionIdMarker: normalized.versionIdMarker ?? '',
    maxKeys: normalized.maxKeys,
    isTruncated: remainder.length > 0,
    nextKeyMarker: next?.key ?? null,
    nextVersionIdMarker: next?.versionId ?? null,
    versions: versionsWithLatest,
  }
}

export async function deleteObjectVersion(
  bucket: BucketContext,
  objectKey: string,
  versionId: string,
): Promise<{ isDeleteMarker: boolean }> {
  if (versionId === 'null') {
    const upstreamObjectKey = buildUpstreamObjectKey(
      bucket.userId,
      bucket.bucketId,
      bucket.mappedFolderId,
      objectKey,
    )
    const fileRows = await db
      .select({ providerId: file.providerId })
      .from(file)
      .where(
        and(
          eq(file.userId, bucket.userId),
          eq(file.objectKey, upstreamObjectKey),
          eq(file.isDeleted, false),
        ),
      )
      .limit(1)

    const currentFile = fileRows[0]
    if (!currentFile) {
      throw new Error('NoSuchVersion')
    }

    const provider = await getProviderClientById(currentFile.providerId)
    await provider.client.send(
      new DeleteObjectCommand({
        Bucket: provider.bucketName,
        Key: upstreamObjectKey,
      }),
    )

    await db
      .update(file)
      .set({ isDeleted: true, deletedAt: new Date() })
      .where(
        and(
          eq(file.userId, bucket.userId),
          eq(file.objectKey, upstreamObjectKey),
        ),
      )

    await db
      .delete(fileVersion)
      .where(
        and(
          eq(fileVersion.bucketId, bucket.bucketId),
          eq(fileVersion.objectKey, objectKey),
          eq(fileVersion.versionId, 'null'),
        ),
      )
    return { isDeleteMarker: false }
  }

  const rows = await db
    .select({
      id: fileVersion.id,
      isDeleteMarker: fileVersion.isDeleteMarker,
      storageProviderId: fileVersion.storageProviderId,
      upstreamObjectKey: fileVersion.upstreamObjectKey,
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
  const target = rows[0]
  if (!target) {
    throw new Error('NoSuchVersion')
  }

  if (
    !target.isDeleteMarker &&
    target.storageProviderId &&
    target.upstreamObjectKey
  ) {
    const provider = await getProviderClientById(target.storageProviderId)
    await provider.client.send(
      new DeleteObjectCommand({
        Bucket: provider.bucketName,
        Key: target.upstreamObjectKey,
      }),
    )
  }

  await db.delete(fileVersion).where(eq(fileVersion.id, target.id))

  if (target.isDeleteMarker) {
    const latestVisible = await db
      .select({ versionId: fileVersion.versionId })
      .from(fileVersion)
      .where(
        and(
          eq(fileVersion.bucketId, bucket.bucketId),
          eq(fileVersion.objectKey, objectKey),
          eq(fileVersion.isDeleteMarker, false),
        ),
      )
      .orderBy(desc(fileVersion.createdAt))
      .limit(1)
    const latestVersionId = latestVisible[0]?.versionId
    if (latestVersionId) {
      await restoreObjectVersion(bucket, objectKey, latestVersionId)
    }
  }

  return { isDeleteMarker: target.isDeleteMarker }
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

  const version = rows[0]
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
