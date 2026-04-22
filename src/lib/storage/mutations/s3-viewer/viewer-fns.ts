import { createServerFn } from '@tanstack/react-start'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  getSignedUrl,
  getViewerClient,
} from './client'
import {
  BucketSchema,
  ListSchema,
  ObjectKeySchema,
  PresignSchema,
  UploadSchema,
} from './schemas'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { getVirtualBucketCredentials } from '@/lib/s3-gateway/virtual-buckets'
import { DEFAULT_ASSETS_BUCKET_NAME } from '@/lib/storage/assets-bucket'

export const getS3ViewerCredentialsFn = createServerFn({ method: 'GET' })
  .inputValidator(BucketSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const targetBucket =
      data.bucketName && data.bucketName.length > 0
        ? data.bucketName
        : DEFAULT_ASSETS_BUCKET_NAME
    return getVirtualBucketCredentials(user.id, targetBucket)
  })

export const listS3ViewerObjectsFn = createServerFn({ method: 'GET' })
  .inputValidator(ListSchema)
  .handler(async ({ data }) => {
    const { client } = await getViewerClient(data.bucketName)
    const normalizedPrefix =
      data.prefix && data.prefix.length > 0 ? data.prefix : undefined

    const result = await client.send(
      new ListObjectsV2Command({
        Bucket: data.bucketName,
        Prefix: normalizedPrefix,
        Delimiter: '/',
        ContinuationToken: data.continuationToken,
        MaxKeys: data.maxKeys,
      }),
    )

    const folders = (result.CommonPrefixes ?? [])
      .map((entry) => entry.Prefix ?? '')
      .filter((value) => value.length > 0)
      .map((value) => {
        const trimmed = value.endsWith('/') ? value.slice(0, -1) : value
        const segments = trimmed.split('/')
        return {
          name: segments[segments.length - 1] ?? value,
          prefix: value,
        }
      })

    return {
      prefix: result.Prefix ?? '',
      keyCount: result.KeyCount ?? 0,
      isTruncated: result.IsTruncated ?? false,
      nextContinuationToken: result.NextContinuationToken ?? null,
      folders,
      objects: (result.Contents ?? [])
        .map((entry) => ({
          key: entry.Key ?? '',
          name: entry.Key ? (entry.Key.split('/').at(-1) ?? entry.Key) : '',
          sizeInBytes: entry.Size ?? 0,
          eTag: entry.ETag ?? null,
          lastModified: entry.LastModified
            ? entry.LastModified.toISOString()
            : null,
        }))
        .filter((entry) => {
          if (!entry.key) {
            return false
          }
          if (normalizedPrefix && entry.key === normalizedPrefix) {
            return false
          }
          return !entry.key.endsWith('/')
        }),
    }
  })

export const createS3ViewerFolderFn = createServerFn({ method: 'POST' })
  .inputValidator(ObjectKeySchema)
  .handler(async ({ data }) => {
    const { client } = await getViewerClient(data.bucketName)
    const folderKey = data.objectKey.endsWith('/')
      ? data.objectKey
      : `${data.objectKey}/`
    const keepFileKey = `${folderKey}.keep`

    await client.send(
      new PutObjectCommand({
        Bucket: data.bucketName,
        Key: keepFileKey,
        Body: '',
        ContentType: 'text/plain',
      }),
    )

    return { ok: true, objectKey: folderKey, keepFileKey }
  })

export const deleteS3ViewerObjectFn = createServerFn({ method: 'POST' })
  .inputValidator(ObjectKeySchema)
  .handler(async ({ data }) => {
    const { client } = await getViewerClient(data.bucketName)
    await client.send(
      new DeleteObjectCommand({
        Bucket: data.bucketName,
        Key: data.objectKey,
      }),
    )
    return { ok: true }
  })

export const uploadS3ViewerObjectFn = createServerFn({ method: 'POST' })
  .inputValidator(UploadSchema)
  .handler(async ({ data }) => {
    const { client } = await getViewerClient(data.bucketName)
    const content = Buffer.from(data.contentBase64, 'base64')

    await client.send(
      new PutObjectCommand({
        Bucket: data.bucketName,
        Key: data.objectKey,
        Body: content,
        ContentType:
          data.contentType && data.contentType.length > 0
            ? data.contentType
            : undefined,
      }),
    )

    return { ok: true, uploadedBytes: content.byteLength }
  })

export const createS3ViewerPresignUrlFn = createServerFn({ method: 'POST' })
  .inputValidator(PresignSchema)
  .handler(async ({ data }) => {
    const { client } = await getViewerClient(data.bucketName)
    const url = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: data.bucketName,
        Key: data.objectKey,
      }),
      { expiresIn: data.expiresInSeconds },
    )

    return { url }
  })
