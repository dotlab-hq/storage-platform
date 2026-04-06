import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { getVirtualBucketCredentials } from '@/lib/s3-gateway/virtual-buckets'

const BucketSchema = z.object({
  bucketName: z.string().trim().min(3).max(63),
})
const ListSchema = BucketSchema.extend({
  prefix: z.string().trim().optional(),
  maxKeys: z.number().int().min(1).max(1000).default(100),
  continuationToken: z.string().trim().optional(),
})

const ObjectKeySchema = BucketSchema.extend({
  objectKey: z.string().trim().min(1),
})
const UploadSchema = ObjectKeySchema.extend({
  contentBase64: z.string().min(1),
  contentType: z.string().trim().optional(),
})

const PresignSchema = ObjectKeySchema.extend({
  expiresInSeconds: z.number().int().min(60).max(3600).default(900),
})
type ViewerClient = {
  client: S3Client
  credentials: Awaited<ReturnType<typeof getVirtualBucketCredentials>>
}

function isLoopbackHost(hostname: string): boolean {
  return (
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  )
}

function resolveS3Endpoint(endpoint: string): string {
  const trimmed = endpoint.replace(/\/+$/g, '')
  if (trimmed.endsWith('/api/storage/s3')) {
    return trimmed
  }
  return `${trimmed}/api/storage/s3`
}

function resolveRequestScopedEndpoint(
  configuredEndpoint: string,
  requestOrigin: string | null,
): string {
  const normalizedConfigured = resolveS3Endpoint(configuredEndpoint)
  if (!requestOrigin) {
    return normalizedConfigured
  }
  try {
    const requestUrl = new URL(requestOrigin)
    const configuredUrl = new URL(normalizedConfigured)
    if (
      isLoopbackHost(requestUrl.hostname) &&
      !isLoopbackHost(configuredUrl.hostname)
    ) {
      return `${requestUrl.origin}/api/storage/s3`
    }
  } catch {
    return normalizedConfigured
  }
  return normalizedConfigured
}

function getRequestOrigin(): string | null {
  const request = getRequest()
  if (!request) {
    return null
  }
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')
  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}`
  }
  return new URL(request.url).origin
}

async function getViewerClient(bucketName: string): Promise<ViewerClient> {
  const user = await getAuthenticatedUser()
  const credentials = await getVirtualBucketCredentials(user.id, bucketName)
  const requestScopedEndpoint = resolveRequestScopedEndpoint(
    credentials.endpoint,
    getRequestOrigin(),
  )
  return {
    credentials,
    client: new S3Client({
      region: credentials.region,
      endpoint: requestScopedEndpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    }),
  }
}

export const getS3ViewerCredentialsFn = createServerFn({ method: 'GET' })
  .inputValidator(BucketSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    return getVirtualBucketCredentials(user.id, data.bucketName)
  })

export const listS3ViewerObjectsFn = createServerFn({ method: 'GET' })
  .inputValidator(ListSchema)
  .handler(async ({ data }) => {
    const { client } = await getViewerClient(data.bucketName)
    const normalizedPrefix =
      data.prefix && data.prefix.length > 0 ? data.prefix : undefined
    const result = await (async () => {
      try {
        return await client.send(
          new ListObjectsV2Command({
            Bucket: data.bucketName,
            Prefix: normalizedPrefix,
            Delimiter: '/',
            ContinuationToken: data.continuationToken,
            MaxKeys: data.maxKeys,
          }),
        )
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown list error'
        if (message.includes('Deserialization error')) {
          throw new Error(
            'S3 list returned a non-XML response. Verify S3 endpoint/auth configuration and retry.',
          )
        }
        throw error
      }
    })()

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
    // Create folder with .keep file since some S3 providers don't support empty directories
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

const UploadPresignSchema = ObjectKeySchema.extend({
  contentType: z.string().trim().optional(),
  expiresInSeconds: z.number().int().min(60).max(3600).default(900),
})

export const createS3ViewerUploadPresignUrlFn = createServerFn({
  method: 'POST',
})
  .inputValidator(UploadPresignSchema)
  .handler(async ({ data }) => {
    const { client } = await getViewerClient(data.bucketName)
    const url = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: data.bucketName,
        Key: data.objectKey,
        ContentType:
          data.contentType && data.contentType.length > 0
            ? data.contentType
            : 'application/octet-stream',
      }),
      { expiresIn: data.expiresInSeconds },
    )
    return { url }
  })
