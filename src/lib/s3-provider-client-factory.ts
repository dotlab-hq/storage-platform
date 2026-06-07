import { S3Client } from '@aws-sdk/client-s3'
import type { storageProvider } from '@/db/schema/storage-provider'
import { decryptProviderSecret } from '@/lib/provider-crypto'
import { UNDETERMINED_PROVIDER_VALUE } from '@/lib/storage-provider-constants'

export type ProviderClientConfig = {
  providerId: string | null
  providerName: string
  bucketName: string
  endpoint: string
  proxyUploadsEnabled: boolean
  region: string
  client: S3Client
}

type ProviderRow = typeof storageProvider.$inferSelect

const DEFAULT_S3_REGION = 'us-east-1'
const INVALID_REGION_SENTINELS = new Set([
  '',
  UNDETERMINED_PROVIDER_VALUE,
  'pending',
  'null',
  'undefined',
  'bucket',
  'auto',
])

function safeTrim(value: string | null | undefined): string {
  return (value ?? '').replace(/^['"]|['"]$/g, '').trim()
}

function resolveRegion(rawRegion?: string | null): string {
  const normalizedRegion = safeTrim(rawRegion).toLowerCase()
  if (
    !INVALID_REGION_SENTINELS.has(normalizedRegion) &&
    normalizedRegion.length > 0
  ) {
    return safeTrim(rawRegion)
  }

  console.warn(
    `[resolveRegion] Region not set or invalid, using ${DEFAULT_S3_REGION}`,
  )
  return DEFAULT_S3_REGION
}

export function fromProviderRow(row: ProviderRow): ProviderClientConfig {
  const accessKeyId = safeTrim(decryptProviderSecret(row.accessKeyIdEncrypted))
  const secretAccessKey = safeTrim(
    decryptProviderSecret(row.secretAccessKeyEncrypted),
  )
  const region = resolveRegion(row.region)
  const endpoint = safeTrim(row.endpoint)

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    const missing: string[] = []
    if (!accessKeyId) missing.push('accessKeyId')
    if (!secretAccessKey) missing.push('secretAccessKey')
    if (!endpoint) missing.push('endpoint')
    throw new Error(
      `Storage provider "${row.name}" is missing required credentials: ${missing.join(', ')}`,
    )
  }

  const client = new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    bucketEndpoint: false,
    // Disable the SDK's automatic "aws-chunked" content encoding. Some
    // S3-compatible providers (e.g. the one behind storage.wpsadi.dev) reject
    // requests with `Transfer-Encoding: chunked` + `Content-Encoding: aws-chunked`
    // and respond with 503 ServiceUnavailable. WHEN_REQUIRED lets the SDK
    // buffer the body so it can emit a plain `Content-Length` header instead.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  return {
    providerId: row.id,
    region,
    providerName: row.name,
    bucketName: row.bucketName,
    endpoint,
    proxyUploadsEnabled: row.proxyUploadsEnabled,
    client,
  }
}
