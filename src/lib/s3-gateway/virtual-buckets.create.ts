import { db } from '@/db'
import { virtualBucket } from '@/db/schema/s3-gateway'
import { folder } from '@/db/schema/storage'
import { user } from '@/db/schema/auth-schema'
import type { S3BucketItem } from '@/types/s3-buckets'
import { and, eq } from 'drizzle-orm'
import { replaceBucketCors } from '@/lib/s3-gateway/s3-bucket-controls'
import { toBucketItem } from '@/lib/s3-gateway/virtual-buckets.shared'
import { generateDefaultAssetsBucketName } from '@/lib/storage/assets-bucket'
import { upsertFolderNode } from '@/lib/storage-btree/index'
import { upsertBucketContextCache } from '@/lib/s3-gateway/virtual-bucket-kv-cache'

type CreateBucketInput = {
  userId: string
  bucketName: string
}

async function createVirtualBucketRow(
  input: CreateBucketInput,
): Promise<S3BucketItem> {
  const bucketId = crypto.randomUUID()

  // Bucket names are globally unique (DB-level enforced by the unique index
  // on virtual_bucket.name), so a single lookup is enough to detect a clash.
  const existing = await db
    .select({ id: virtualBucket.id })
    .from(virtualBucket)
    .where(
      and(eq(virtualBucket.name, input.bucketName), eq(virtualBucket.isActive, true)),
    )
    .limit(1)

  if (existing.length > 0) {
    throw new Error('A bucket with this name already exists')
  }

  const createdFolders = await db
    .insert(folder)
    .values({
      id: crypto.randomUUID(),
      userId: input.userId,
      name: input.bucketName,
      parentFolderId: null,
      virtualBucketId: bucketId,
    })
    .returning({ id: folder.id })

  const createdRows = await db
    .insert(virtualBucket)
    .values({
      id: bucketId,
      userId: input.userId,
      name: input.bucketName,
      mappedFolderId: createdFolders[0].id,
      objectOwnershipMode: 'bucket-owner-enforced',
      createdByUserId: input.userId,
      isActive: true,
    })
    .returning({
      id: virtualBucket.id,
      name: virtualBucket.name,
      mappedFolderId: virtualBucket.mappedFolderId,
      isActive: virtualBucket.isActive,
      createdAt: virtualBucket.createdAt,
      credentialVersion: virtualBucket.credentialVersion,
    })

  await upsertFolderNode({
    userId: input.userId,
    folderId: createdFolders[0].id,
    name: input.bucketName,
    parentFolderId: null,
    isDeleted: false,
  })

  await replaceBucketCors(bucketId, [
    {
      allowedOrigins: ['*'],
      allowedMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['*'],
      exposeHeaders: ['ETag'],
      maxAgeSeconds: 3000,
    },
  ])

  if (createdRows.length === 0) {
    throw new Error('Failed to create virtual bucket')
  }
  await upsertBucketContextCache({
    userId: input.userId,
    bucketId,
    bucketName: input.bucketName,
    mappedFolderId: createdFolders[0].id,
    blockPublicAccess: true,
    createdAt: createdRows[0].createdAt,
    credentialVersion: createdRows[0].credentialVersion,
  })

  const defaultAssetsBucketName = await getDefaultAssetsBucketNameForUser(input.userId)
  return toBucketItem(createdRows[0], defaultAssetsBucketName)
}

async function getDefaultAssetsBucketNameForUser(
  userId: string,
): Promise<string | null> {
  const rows = await db
    .select({ name: user.defaultAssetsBucketName })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
  return rows[0]?.name ?? null
}

export async function createVirtualBucket(
  userId: string,
  bucketName: string,
): Promise<S3BucketItem> {
  return createVirtualBucketRow({ userId, bucketName })
}

export async function ensureDefaultAssetsBucket(
  userId: string,
): Promise<S3BucketItem> {
  // 1. Read the user's stored default assets bucket name (set on first
  //    creation or by the data migration).
  const storedName = await getDefaultAssetsBucketNameForUser(userId)

  if (storedName) {
    const existing = await db
      .select({
        id: virtualBucket.id,
        name: virtualBucket.name,
        mappedFolderId: virtualBucket.mappedFolderId,
        isActive: virtualBucket.isActive,
        createdAt: virtualBucket.createdAt,
      })
      .from(virtualBucket)
      .where(
        and(
          eq(virtualBucket.userId, userId),
          eq(virtualBucket.name, storedName),
          eq(virtualBucket.isActive, true),
        ),
      )
      .limit(1)

    if (existing.length > 0) {
      return toBucketItem(existing[0], storedName)
    }
  }

  // 2. Bucket missing (or user has no default name yet) — create one with a
  //    fresh globally-unique suffixed name, then persist it on the user.
  const bucketName = generateDefaultAssetsBucketName()
  const created = await createVirtualBucketRow({ userId, bucketName })

  await db
    .update(user)
    .set({ defaultAssetsBucketName: bucketName })
    .where(eq(user.id, userId))

  return created
}
