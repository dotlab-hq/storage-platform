import type { BucketContext } from '@/lib/s3-gateway/s3-context'
import {
  isSecretValid,
  resolveBucketByAccessKey,
} from '@/lib/s3-gateway/s3-context'

export type WebDavPrincipal = {
  userId: string
  accessBucket: BucketContext
}

function decodeBasicAuth(value: string): { user: string; password: string } | null {
  if (!value.toLowerCase().startsWith('basic ')) return null
  try {
    const decoded = atob(value.slice('basic '.length).trim())
    const separator = decoded.indexOf(':')
    if (separator <= 0) return null
    return {
      user: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    }
  } catch {
    return null
  }
}

function unauthorized(message = 'WebDAV credentials are required'): Response {
  return new Response(message, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Storage Platform WebDAV"',
      DAV: '1, 2',
    },
  })
}

export async function authenticateWebDav(
  request: Request,
): Promise<WebDavPrincipal | Response> {
  const basic = decodeBasicAuth(request.headers.get('authorization') ?? '')
  if (!basic) return unauthorized()

  const bucket = await resolveBucketByAccessKey(basic.user)
  if (!bucket || !isSecretValid(bucket, basic.password)) {
    return unauthorized('Invalid WebDAV credentials')
  }

  return {
    userId: bucket.userId,
    accessBucket: bucket,
  }
}

export function assertBucketPrincipal(
  principal: WebDavPrincipal,
  bucket: BucketContext,
): boolean {
  return principal.userId === bucket.userId
}
