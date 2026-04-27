import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getRequest } from '@tanstack/react-start/server'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { getVirtualBucketCredentials } from '@/lib/s3-gateway/virtual-buckets'

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
  if (!credentials.region || !credentials.region.trim()) {
    throw new Error(
      `S3 region is missing for bucket ${bucketName}. Check bucket configuration.`,
    )
  }

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

export {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  getSignedUrl,
}
