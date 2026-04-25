import { createHash, createHmac } from 'node:crypto'
import { db } from '@/db'
import { virtualBucket } from '@/db/schema/s3-gateway'
import { and, eq } from 'drizzle-orm'
import {
  getCachedBucketByAccessKey,
  getCachedBucketByName,
  upsertBucketContextCache,
} from '@/lib/s3-gateway/virtual-bucket-kv-cache'

export type BucketContext = {
  userId: string
  bucketId: string
  bucketName: string
  mappedFolderId: string | null
  createdAt: Date
  credentialVersion: number
}

type BucketRow = {
  userId: string
  id: string
  name: string
  mappedFolderId: string | null
  createdAt: Date
  credentialVersion: number
}

const SKEW_WINDOW_MS = 5 * 60 * 1000

function compareAscii(left: string, right: string): number {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

function hmacHex(key: string | Buffer, value: string): string {
  return createHmac('sha256', key).update(value).digest('hex')
}

function hmac(key: string | Buffer, value: string): Buffer {
  return createHmac('sha256', key).update(value).digest()
}

function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function parseAmzDate(value: string): Date | null {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/)
  if (!match) {
    return null
  }
  const [, year, month, day, hour, minute, second] = match
  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    ),
  )
}

function encodeRfc3986(value: string): string {
  return encodeURIComponent(value)
    .replaceAll('!', '%21')
    .replaceAll("'", '%27')
    .replaceAll('(', '%28')
    .replaceAll(')', '%29')
    .replaceAll('*', '%2A')
}

function canonicalQueryString(url: URL, includeSignature: boolean): string {
  const pairs: Array<{ key: string; value: string }> = []
  for (const [key, value] of url.searchParams.entries()) {
    if (!includeSignature && key === 'X-Amz-Signature') {
      continue
    }
    pairs.push({ key, value })
  }
  pairs.sort((a, b) => {
    const k = compareAscii(a.key, b.key)
    if (k !== 0) return k
    return compareAscii(a.value, b.value)
  })
  return pairs
    .map((pair) => `${encodeRfc3986(pair.key)}=${encodeRfc3986(pair.value)}`)
    .join('&')
}

function canonicalQueryStringWithoutEmptyEquals(
  url: URL,
  includeSignature: boolean,
): string {
  const pairs: Array<{ key: string; value: string }> = []
  for (const [key, value] of url.searchParams.entries()) {
    if (!includeSignature && key === 'X-Amz-Signature') {
      continue
    }
    pairs.push({ key, value })
  }
  pairs.sort((a, b) => {
    const k = compareAscii(a.key, b.key)
    if (k !== 0) return k
    return compareAscii(a.value, b.value)
  })
  return pairs
    .map((pair) =>
      pair.value.length === 0
        ? encodeRfc3986(pair.key)
        : `${encodeRfc3986(pair.key)}=${encodeRfc3986(pair.value)}`,
    )
    .join('&')
}

function normalizeHeaderValue(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function canonicalHeaders(
  request: Request,
  signedHeaders: string[],
): { headers: string; signedHeaders: string } {
  const lowered = signedHeaders
    .map((header) => header.trim().toLowerCase())
    .filter((header) => header.length > 0)
  const unique = Array.from(new Set(lowered)).sort()
  const parts = unique.map(
    (name) =>
      `${name}:${normalizeHeaderValue(request.headers.get(name) ?? '')}`,
  )
  return {
    headers: `${parts.join('\n')}\n`,
    signedHeaders: unique.join(';'),
  }
}

function canonicalHeadersWithOverrides(
  request: Request,
  signedHeaders: string[],
  overrides: Partial<Record<string, string>>,
): { headers: string; signedHeaders: string } {
  const lowered = signedHeaders
    .map((header) => header.trim().toLowerCase())
    .filter((header) => header.length > 0)
  const unique = Array.from(new Set(lowered)).sort()
  const parts = unique.map((name) => {
    const override = overrides[name]
    const value =
      override !== undefined ? override : (request.headers.get(name) ?? '')
    return `${name}:${normalizeHeaderValue(value)}`
  })
  return {
    headers: `${parts.join('\n')}\n`,
    signedHeaders: unique.join(';'),
  }
}

function canonicalHeaderCandidates(
  request: Request,
  signedHeaders: string[],
): Array<{ headers: string; signedHeaders: string }> {
  const lowered = signedHeaders.map((header) => header.trim().toLowerCase())
  if (!lowered.includes('accept-encoding')) {
    return [canonicalHeaders(request, signedHeaders)]
  }

  const raw = request.headers.get('accept-encoding') ?? ''
  const variants = Array.from(new Set([raw, 'identity', 'gzip', '']))
  return variants.map((value) =>
    canonicalHeadersWithOverrides(request, signedHeaders, {
      'accept-encoding': value,
    }),
  )
}

function deriveSigningKey(
  secretAccessKey: string,
  dateStamp: string,
  region: string,
  service: string,
): Buffer {
  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, service)
  return hmac(kService, 'aws4_request')
}

function canonicalUri(url: URL): string {
  return url.pathname
    .split('/')
    .map((segment) => encodeRfc3986(decodeURIComponent(segment)))
    .join('/')
}

function canonicalUriRaw(url: URL): string {
  return url.pathname
}

function normalizeCredentialValue(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function isHeaderSignatureMatch(input: {
  request: Request
  url: URL
  amzDate: string
  dateStamp: string
  region: string
  service: string
  signingKey: Buffer
  signature: string
  payloadHash: string
  signedHeaders: string[]
}): boolean {
  const canonicalCandidates = canonicalHeaderCandidates(
    input.request,
    input.signedHeaders,
  )
  const canonicalUris = [canonicalUri(input.url), canonicalUriRaw(input.url)]
  const canonicalQueries = [
    canonicalQueryString(input.url, true),
    canonicalQueryStringWithoutEmptyEquals(input.url, true),
  ]

  for (const uri of canonicalUris) {
    for (const query of canonicalQueries) {
      for (const canonical of canonicalCandidates) {
        const canonicalRequest = [
          input.request.method,
          uri,
          query,
          canonical.headers,
          canonical.signedHeaders,
          input.payloadHash,
        ].join('\n')

        const stringToSign = [
          'AWS4-HMAC-SHA256',
          input.amzDate,
          `${input.dateStamp}/${input.region}/${input.service}/aws4_request`,
          sha256Hex(canonicalRequest),
        ].join('\n')

        const expectedSignature = hmacHex(input.signingKey, stringToSign)
        if (expectedSignature.toLowerCase() === input.signature.toLowerCase()) {
          return true
        }
      }
    }
  }

  return false
}

function isQuerySignatureMatch(input: {
  request: Request
  url: URL
  amzDate: string
  dateStamp: string
  region: string
  service: string
  signingKey: Buffer
  signature: string
  signedHeadersRaw: string
}): boolean {
  const canonicalCandidates = canonicalHeaderCandidates(
    input.request,
    input.signedHeadersRaw.split(';'),
  )
  const canonicalUris = [canonicalUri(input.url), canonicalUriRaw(input.url)]
  const canonicalQueries = [
    canonicalQueryString(input.url, false),
    canonicalQueryStringWithoutEmptyEquals(input.url, false),
  ]

  for (const uri of canonicalUris) {
    for (const query of canonicalQueries) {
      for (const canonical of canonicalCandidates) {
        const canonicalRequest = [
          input.request.method,
          uri,
          query,
          canonical.headers,
          canonical.signedHeaders,
          'UNSIGNED-PAYLOAD',
        ].join('\n')

        const stringToSign = [
          'AWS4-HMAC-SHA256',
          input.amzDate,
          `${input.dateStamp}/${input.region}/${input.service}/aws4_request`,
          sha256Hex(canonicalRequest),
        ].join('\n')

        const expectedSignature = hmacHex(input.signingKey, stringToSign)
        if (expectedSignature.toLowerCase() === input.signature.toLowerCase()) {
          return true
        }
      }
    }
  }

  return false
}

function isWithinSkew(requestDate: Date): boolean {
  const now = Date.now()
  return Math.abs(now - requestDate.getTime()) <= SKEW_WINDOW_MS
}

function signingSecret(): string {
  const secret =
    process.env.S3_GATEWAY_CREDENTIAL_SECRET ?? process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error('Missing credential signing secret')
  }
  return secret
}

function accessKeyForBucket(bucketId: string): string {
  return `sp_${bucketId.replaceAll('-', '').slice(0, 20)}`
}

export function accessKeyIdForBucket(bucketId: string): string {
  return accessKeyForBucket(bucketId)
}

export function canonicalIdForUser(userId: string): string {
  return createHash('sha256').update(userId).digest('hex')
}

function secretForBucket(
  userId: string,
  bucketId: string,
  bucketName: string,
  credentialVersion: number,
): string {
  const digest = createHmac('sha256', signingSecret())
    .update(`${userId}:${bucketId}:${bucketName}:${credentialVersion}`)
    .digest('hex')
  return `${digest}${digest.slice(0, 24)}`
}

function toContext(row: BucketRow): BucketContext {
  return {
    userId: row.userId,
    bucketId: row.id,
    bucketName: row.name,
    mappedFolderId: row.mappedFolderId,
    createdAt: row.createdAt,
    credentialVersion: row.credentialVersion,
  }
}

export async function resolveBucketByName(
  bucketName: string,
): Promise<BucketContext | null> {
  const cached = await getCachedBucketByName(bucketName)
  if (cached) {
    return cached
  }

  const rows = await db
    .select({
      userId: virtualBucket.userId,
      id: virtualBucket.id,
      name: virtualBucket.name,
      mappedFolderId: virtualBucket.mappedFolderId,
      createdAt: virtualBucket.createdAt,
      credentialVersion: virtualBucket.credentialVersion,
    })
    .from(virtualBucket)
    .where(
      and(eq(virtualBucket.name, bucketName), eq(virtualBucket.isActive, true)),
    )
    .limit(1)

  const context = rows[0] ? toContext(rows[0]) : null
  if (context) {
    await upsertBucketContextCache(context)
  }
  return context
}

export async function resolveBucketByAccessKey(
  accessKeyId: string,
): Promise<BucketContext | null> {
  const cached = await getCachedBucketByAccessKey(accessKeyId)
  if (cached) {
    return cached
  }

  const rows = await db
    .select({
      userId: virtualBucket.userId,
      id: virtualBucket.id,
      name: virtualBucket.name,
      mappedFolderId: virtualBucket.mappedFolderId,
      createdAt: virtualBucket.createdAt,
      credentialVersion: virtualBucket.credentialVersion,
    })
    .from(virtualBucket)
    .where(eq(virtualBucket.isActive, true))

  const matched = rows.find((row) => accessKeyForBucket(row.id) === accessKeyId)
  const context = matched ? toContext(matched) : null
  if (context) {
    await upsertBucketContextCache(context)
  }
  return context
}

export function parseAccessKeyId(request: Request): string | null {
  const authorization = request.headers.get('authorization')
  if (authorization) {
    const credentialMatch = authorization.match(/Credential=([^,\s]+)/)
    const credential = credentialMatch?.[1]
      ? normalizeCredentialValue(credentialMatch[1])
      : undefined
    const accessKey = credential?.split('/')[0]
    if (accessKey) {
      return accessKey
    }
  }

  const url = new URL(request.url)
  const queryCredential = url.searchParams.get('X-Amz-Credential')
  if (queryCredential) {
    return normalizeCredentialValue(queryCredential).split('/')[0] ?? null
  }

  return null
}

export function isSecretValid(bucket: BucketContext, secret: string): boolean {
  return (
    secretForBucket(
      bucket.userId,
      bucket.bucketId,
      bucket.bucketName,
      bucket.credentialVersion,
    ) === secret
  )
}

export function isSigV4Valid(request: Request, bucket: BucketContext): boolean {
  const url = new URL(request.url)
  const authorization = request.headers.get('authorization')
  const querySignature = url.searchParams.get('X-Amz-Signature')
  const secretAccessKey = secretForBucket(
    bucket.userId,
    bucket.bucketId,
    bucket.bucketName,
    bucket.credentialVersion,
  )

  if (authorization) {
    const credentialMatch = authorization.match(/Credential=([^,\s]+)/)
    const signedHeadersMatch = authorization.match(/SignedHeaders=([^,\s]+)/)
    const signatureMatch = authorization.match(/Signature=([a-fA-F0-9]+)/)
    if (!credentialMatch || !signedHeadersMatch || !signatureMatch) {
      return false
    }

    const credential = normalizeCredentialValue(credentialMatch[1])
    const scopeParts = credential.split('/')
    if (scopeParts.length < 5) {
      return false
    }
    const [accessKeyId, dateStamp, region, service] = scopeParts
    if (accessKeyId !== parseAccessKeyId(request)) {
      return false
    }

    const amzDate = request.headers.get('x-amz-date')
    if (!amzDate) {
      return false
    }
    const parsedDate = parseAmzDate(amzDate)
    if (!parsedDate || !isWithinSkew(parsedDate)) {
      return false
    }

    const payloadHash =
      request.headers.get('x-amz-content-sha256') ?? 'UNSIGNED-PAYLOAD'
    const signedHeaders = signedHeadersMatch[1].split(';')
    const signingKey = deriveSigningKey(
      secretAccessKey,
      dateStamp,
      region,
      service,
    )
    return isHeaderSignatureMatch({
      request,
      url,
      amzDate,
      dateStamp,
      region,
      service,
      signingKey,
      signature: signatureMatch[1],
      payloadHash,
      signedHeaders,
    })
  }

  if (querySignature) {
    const algorithm = url.searchParams.get('X-Amz-Algorithm')
    const credential = url.searchParams.get('X-Amz-Credential')
    const amzDate = url.searchParams.get('X-Amz-Date')
    const expires = url.searchParams.get('X-Amz-Expires')
    const signedHeadersRaw = url.searchParams.get('X-Amz-SignedHeaders')
    if (
      algorithm !== 'AWS4-HMAC-SHA256' ||
      !credential ||
      !amzDate ||
      !expires ||
      !signedHeadersRaw
    ) {
      return false
    }

    const scopeParts = normalizeCredentialValue(credential).split('/')
    if (scopeParts.length < 5) {
      return false
    }
    const [accessKeyId, dateStamp, region, service] = scopeParts
    if (accessKeyId !== parseAccessKeyId(request)) {
      return false
    }

    const expiresSeconds = Number.parseInt(expires, 10)
    if (
      !Number.isFinite(expiresSeconds) ||
      expiresSeconds < 1 ||
      expiresSeconds > 604800
    ) {
      return false
    }

    const parsedDate = parseAmzDate(amzDate)
    if (!parsedDate) {
      return false
    }
    const now = Date.now()
    const start = parsedDate.getTime() - SKEW_WINDOW_MS
    const end = parsedDate.getTime() + expiresSeconds * 1000
    if (now < start || now > end) {
      return false
    }

    const signingKey = deriveSigningKey(
      secretAccessKey,
      dateStamp,
      region,
      service,
    )
    return isQuerySignatureMatch({
      request,
      url,
      amzDate,
      dateStamp,
      region,
      service,
      signingKey,
      signature: querySignature,
      signedHeadersRaw,
    })
  }

  return false
}
