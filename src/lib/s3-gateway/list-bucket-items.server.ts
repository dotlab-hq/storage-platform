import { db } from '@/db'
import { virtualBucket } from '@/db/schema/s3-gateway'
import { and, eq } from 'drizzle-orm'
import { listObjectsV2 } from '@/lib/s3-gateway/s3-object-store'
import type { BucketContext } from '@/lib/s3-gateway/s3-context'

export type S3BucketItemsResponse = {
  prefix: string
  keyCount: number
  isTruncated: boolean
  nextContinuationToken: string | null
  folders: { name: string; prefix: string }[]
  objects: {
    key: string
    name: string
    sizeInBytes: number
    eTag: string | null
    lastModified: string | null
  }[]
}

type ListBucketItemsParams = {
  userId: string
  bucketName: string
  prefix?: string
  continuationToken?: string
  maxKeys: number
}

function toFolderEntry(prefix: string): { name: string; prefix: string } {
  const trimmed = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix
  const name = trimmed.split('/').at(-1) ?? trimmed
  return { name, prefix }
}

function normalizePrefix(prefix: string | undefined): string {
  if (!prefix) {
    return ''
  }
  return prefix.endsWith('/') ? prefix : `${prefix}/`
}

type ListedFolder = { name: string; prefix: string }
type ListedObject = {
  key: string
  name: string
  sizeInBytes: number
  eTag: string | null
  lastModified: string | null
}

type ListedEntry =
  | { kind: 'folder'; sortKey: string; folder: ListedFolder }
  | { kind: 'object'; sortKey: string; object: ListedObject }

export async function listBucketItems(
  params: ListBucketItemsParams,
): Promise<S3BucketItemsResponse> {
  try {
    // Get bucket row with all required fields including userId
    const rows = await db
      .select({
        userId: virtualBucket.userId,
        id: virtualBucket.id,
        name: virtualBucket.name,
        mappedFolderId: virtualBucket.mappedFolderId,
        blockPublicAccess: virtualBucket.blockPublicAccess,
        createdAt: virtualBucket.createdAt,
        credentialVersion: virtualBucket.credentialVersion,
      })
      .from(virtualBucket)
      .where(
        and(
          eq(virtualBucket.userId, params.userId),
          eq(virtualBucket.name, params.bucketName),
          eq(virtualBucket.isActive, true),
        ),
      )
      .limit(1)

    const row = rows[0]
    if (!row) {
      throw new Error('Virtual bucket not found')
    }

    // Convert to BucketContext
    const bucket: BucketContext = {
      userId: row.userId,
      bucketId: row.id,
      bucketName: row.name,
      mappedFolderId: row.mappedFolderId,
      blockPublicAccess: row.blockPublicAccess,
      createdAt: row.createdAt,
      credentialVersion: row.credentialVersion,
    }

    const requestPrefix = normalizePrefix(params.prefix)
    const objects = await listObjectsV2(bucket, requestPrefix)

    const folderPrefixSet = new Set<string>()
    const fileObjectMap = new Map<string, ListedObject>()

    for (const obj of objects) {
      if (!obj.key.startsWith(requestPrefix)) {
        continue
      }

      const relativeKey = obj.key.slice(requestPrefix.length)
      if (relativeKey.length === 0) {
        continue
      }

      const slashIndex = relativeKey.indexOf('/')
      if (slashIndex >= 0) {
        const folderSegment = relativeKey.slice(0, slashIndex)
        if (folderSegment.length > 0) {
          folderPrefixSet.add(`${requestPrefix}${folderSegment}/`)
        }
        continue
      }

      fileObjectMap.set(obj.key, {
        key: obj.key,
        name: relativeKey,
        sizeInBytes: obj.size,
        eTag: obj.eTag,
        lastModified: obj.lastModified ? obj.lastModified.toISOString() : null,
      })
    }

    const entries: ListedEntry[] = [
      ...Array.from(folderPrefixSet).map((folderPrefix) => ({
        kind: 'folder' as const,
        sortKey: folderPrefix,
        folder: toFolderEntry(folderPrefix),
      })),
      ...Array.from(fileObjectMap.values()).map((object) => ({
        kind: 'object' as const,
        sortKey: object.key,
        object,
      })),
    ]

    entries.sort((left, right) => left.sortKey.localeCompare(right.sortKey))

    const token = params.continuationToken ?? null
    const startIndex =
      token === null ? 0 : entries.findIndex((entry) => entry.sortKey > token)
    const normalizedStartIndex = startIndex < 0 ? entries.length : startIndex
    const pageEntries = entries.slice(
      normalizedStartIndex,
      normalizedStartIndex + params.maxKeys,
    )

    const folders: ListedFolder[] = []
    const sortedObjects: ListedObject[] = []
    for (const entry of pageEntries) {
      if (entry.kind === 'folder') {
        folders.push(entry.folder)
      } else {
        sortedObjects.push(entry.object)
      }
    }

    const hasMore = normalizedStartIndex + pageEntries.length < entries.length
    const nextContinuationToken = hasMore
      ? (pageEntries[pageEntries.length - 1]?.sortKey ?? null)
      : null

    return {
      prefix: requestPrefix,
      keyCount: pageEntries.length,
      isTruncated: hasMore,
      nextContinuationToken,
      folders,
      objects: sortedObjects,
    }
  } catch (error) {
    console.error('[listBucketItems] Error:', {
      bucketName: params.bucketName,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}
