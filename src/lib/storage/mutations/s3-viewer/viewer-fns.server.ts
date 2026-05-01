'use server'

import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getAuthenticatedUser } from '@/lib/server-auth.server'
import { getVirtualBucketCredentials } from '@/lib/s3-gateway/virtual-buckets.server'
import { DEFAULT_ASSETS_BUCKET_NAME } from '@/lib/storage/assets-bucket'
import {
  BucketSchema,
  ListSchema,
  ObjectKeySchema,
  PresignSchema,
  UploadSchema,
} from './schemas'

export type ViewerClient = {
  client: S3Client
  credentials: Awaited<ReturnType<typeof getVirtualBucketCredentials>>
}

function isLoopbackHost(hostname: string): boolean {
  return (
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  )
}

export function resolveS3Endpoint(endpoint: string): string {
  const trimmed = endpoint.replace(/\/+$/g, '')
  if (trimmed.endsWith('/api/storage/s3')) {
    return trimmed
  }
  return `${trimmed}/api/storage/s3`
}

export function normalizeBucketEndpoint(
  endpoint: string,
  bucketName: string,
): string {
  const base = resolveS3Endpoint(endpoint)
  return `${base}/${encodeURIComponent(bucketName)}`
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

export async function getViewerClient(
  bucketName: string,
): Promise<ViewerClient> {
  const user = await getAuthenticatedUser()
  const credentials = await getVirtualBucketCredentials(user.id, bucketName)

  // Defensive: credentials must have a valid region
  const regionTrimmed = credentials.region?.trim() ?? ''
  if (!regionTrimmed) {
    console.error('[getViewerClient] Invalid region for bucket:', {
      bucketName,
      credentialsRegion: credentials.region,
      regionTrimmed,
    })
    throw new Error(
      `S3 region is missing for bucket "${bucketName}". ` +
        `Provider region: ${JSON.stringify(credentials.region)}. ` +
        `Check virtual bucket configuration and ensure region is set correctly.`,
    )
  }

  console.log('[getViewerClient] Creating client:', {
    bucketName,
    region: credentials.region,
    endpoint: credentials.endpoint,
  })

  const requestScopedEndpoint = resolveRequestScopedEndpoint(
    credentials.endpoint,
    getRequestOrigin(),
  )

  try {
    return {
      credentials,
      client: new S3Client({
        region: regionTrimmed,
        endpoint: requestScopedEndpoint,
        forcePathStyle: true,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
        },
      }),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[getViewerClient] Failed to create S3Client:', {
      bucketName,
      region: credentials.region,
      error: message,
    })
    throw error
  }
}

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
    try {
      const { client, credentials } = await getViewerClient(data.bucketName)
      const endpoint = normalizeBucketEndpoint(
        credentials.endpoint,
        data.bucketName,
      )
      const objectPath = `${endpoint}/${encodeURIComponent(data.objectKey)}`
      const response = await fetch(objectPath, {
        method: 'DELETE',
        headers: {
          'x-s3-secret-access-key': credentials.secretAccessKey,
        },
      })
      if (!response.ok && response.status !== 204) {
        let body = ''
        try {
          body = await response.text()
        } catch {
          body = ''
        }
        throw new Error(
          body.length > 0 ? body : `Delete failed with ${response.status}`,
        )
      }
      return { ok: true }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete object'
      throw new Error(message)
    }
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
    try {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error(
        '[createS3ViewerPresignUrlFn] Failed to generate presigned URL:',
        {
          bucketName: data.bucketName,
          objectKey: data.objectKey,
          error: message,
        },
      )
      throw new Error(
        `Failed to generate presigned URL: ${message}. ` +
          `Verify bucket exists and the region is correctly configured.`,
      )
    }
  })
