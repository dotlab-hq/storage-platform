import { db } from '@/db'
import { virtualBucket } from '@/db/schema/s3-gateway'
import { folder } from '@/db/schema/storage'
import type { S3BucketItem } from '@/types/s3-buckets'
import { and, eq } from 'drizzle-orm'
import { replaceBucketCors } from '@/lib/s3-gateway/s3-bucket-controls'
import { toBucketItem } from '@/lib/s3-gateway/virtual-buckets.shared'
import { DEFAULT_ASSETS_BUCKET_NAME } from '@/lib/storage/assets-bucket'
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

  await upsertBucketContextCache({
    userId: input.userId,
    bucketId,
    bucketName: input.bucketName,
    mappedFolderId: createdFolders[0].id,
    createdAt: createdRows[0].createdAt,
  })

  return toBucketItem(createdRows[0])
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
        eq(virtualBucket.name, DEFAULT_ASSETS_BUCKET_NAME),
        eq(virtualBucket.isActive, true),
      ),
    )
    .limit(1)

  if (existing.length > 0) {
    return toBucketItem(existing[0])
  }

  return createVirtualBucketRow({
    userId,
    bucketName: DEFAULT_ASSETS_BUCKET_NAME,
  })
}
