import { S3Client } from '@aws-sdk/client-s3'
import { file } from '@/db/schema/storage'
import { storageProvider } from '@/db/schema/storage-provider'
import { UNDETERMINED_PROVIDER_VALUE } from '@/lib/storage-provider-constants'
import { decryptProviderSecret } from '@/lib/provider-crypto'
import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm'

type ProviderClientConfig = {
  providerId: string | null
  providerName: string
  bucketName: string
  endpoint: string
  proxyUploadsEnabled: boolean
  client: S3Client
}

type ProviderRow = typeof storageProvider.$inferSelect

const DEFAULT_PROVIDER_NAME = 'default provider'
const MAIN_PROVIDER_NAME = 'main'
const DEFAULT_S3_REGION = 'auto'
const INVALID_REGION_SENTINELS = new Set([
  '',
  UNDETERMINED_PROVIDER_VALUE,
  'pending',
  'null',
  'undefined',
])

async function loadDb() {
  const { db } = await import('@/db')
  return db
}

async function getDefaultActiveProvider(): Promise<ProviderRow | null> {
  const db = await loadDb()
  const providerRows = await db
    .select()
    .from(storageProvider)
    .where(
      and(eq(storageProvider.isActive, true), isNull(storageProvider.userId)),
    )
    .orderBy(
      sql`CASE
                WHEN lower(${storageProvider.name}) = ${DEFAULT_PROVIDER_NAME} THEN 0
                WHEN lower(${storageProvider.name}) = ${MAIN_PROVIDER_NAME} THEN 1
                ELSE 2
            END`,
      storageProvider.createdAt,
      storageProvider.id,
    )
    .limit(1)

  if (providerRows.length === 0) {
    return null
  }

  return providerRows[0]
}

function safeTrim(value: string | null | undefined): string {
  return (value ?? '').replace(/^["']|["']$/g, '').trim()
}

function resolveRegion(rawRegion?: string | null): string {
  const normalizedRegion = safeTrim(rawRegion).toLowerCase()
  if (!INVALID_REGION_SENTINELS.has(normalizedRegion)) {
    return safeTrim(rawRegion)
  }
  // No env fallback - pure hardcoded default
  return DEFAULT_S3_REGION
}

function fromEnvironment(): ProviderClientConfig {
  // Only used when no provider configured - use hardcoded defaults, no env
  const accessKeyId = safeTrim(process.env.S3_ACCESS_KEY_ID)
  const secretAccessKey = safeTrim(process.env.S3_SECRET_ACCESS_KEY)
  const region = DEFAULT_S3_REGION
  const endpoint = safeTrim(process.env.S3_ENDPOINT)
  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error('No storage provider exists for uploads')
  }

  console.log('[fromEnvironment] Creating S3 client:', {
    region,
    endpoint,
  })

  return {
    providerId: null,
    providerName: 'Default Provider',
    bucketName: process.env.S3_BUCKET_NAME ?? 'dot-storage',
    endpoint,
    proxyUploadsEnabled: false,
    client: new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      bucketEndpoint: false,
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
      credentials: { accessKeyId, secretAccessKey },
    }),
  }
}

function fromProviderRow(row: ProviderRow): ProviderClientConfig {
  // Access Key ID: must be in DB
  const accessKeyId = safeTrim(decryptProviderSecret(row.accessKeyIdEncrypted))

  // Secret Access Key: must be in DB
  const secretAccessKey = safeTrim(
    decryptProviderSecret(row.secretAccessKeyEncrypted),
  )

  // Region: if row.region is empty/undetermined, use default
  const rawRegion = safeTrim(row.region)
  let region = DEFAULT_S3_REGION // Default to "auto"
  if (
    rawRegion &&
    rawRegion.length > 0 &&
    !INVALID_REGION_SENTINELS.has(rawRegion.toLowerCase())
  ) {
    region = rawRegion
  }

  // Endpoint: must be in DB
  const endpoint = safeTrim(row.endpoint)

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    const missing: string[] = []
    if (!accessKeyId) missing.push('accessKeyId')
    if (!secretAccessKey) missing.push('secretAccessKey')
    if (!endpoint) missing.push('endpoint')
    throw new Error(
      `Storage provider "${row.name}" is missing required credentials: ${missing}`,
    )
  }

  console.log('[fromProviderRow] Creating S3 client:', {
    providerId: row.id,
    providerName: row.name,
    bucketName: row.bucketName,
    region,
    endpoint,
  })

  return {
    providerId: row.id,
    providerName: row.name,
    bucketName: row.bucketName,
    endpoint,
    proxyUploadsEnabled: row.proxyUploadsEnabled,
    client: new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      bucketEndpoint: false,
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    }),
  }
}

export async function getProviderClientById(
  providerId: string | null,
): Promise<ProviderClientConfig> {
  const db = await loadDb()
  if (!providerId) {
    const defaultProvider = await getDefaultActiveProvider()
    if (defaultProvider) {
      return fromProviderRow(defaultProvider)
    }
    throw new Error(
      'No storage provider found. Please add one in the admin settings.',
    )
  }
  const providerRows = await db
    .select()
    .from(storageProvider)
    .where(eq(storageProvider.id, providerId))
    .limit(1)
  if (providerRows.length === 0) {
    throw new Error('Storage provider not found')
  }
  const provider = providerRows[0]
  return fromProviderRow(provider)
}

export async function getSystemProviderClientById(
  providerId: string,
): Promise<ProviderClientConfig> {
  const db = await loadDb()
  const providerRows = await db
    .select()
    .from(storageProvider)
    .where(
      and(eq(storageProvider.id, providerId), isNull(storageProvider.userId)),
    )
    .limit(1)

  if (providerRows.length === 0) {
    throw new Error('Storage provider not found')
  }

  return fromProviderRow(providerRows[0])
}

export async function resolveProviderId(
  providerId: string | null | undefined,
): Promise<string | null> {
  const db = await loadDb()

  if (providerId) {
    const providerRows = await db
      .select({ id: storageProvider.id })
      .from(storageProvider)
      .where(
        and(
          eq(storageProvider.id, providerId),
          isNull(storageProvider.userId),
          eq(storageProvider.isActive, true),
        ),
      )
      .limit(1)

    if (providerRows.length === 0) {
      throw new Error('Only active system providers can be used for uploads')
    }

    return providerId
  }

  const defaultProvider = await getDefaultActiveProvider()
  if (!defaultProvider) {
    return null
  }

  return defaultProvider.id
}

export async function selectProviderForUpload(
  incomingFileSize: number,
  _userId: string,
): Promise<ProviderClientConfig> {
  const db = await loadDb()
  const providers = await db
    .select()
    .from(storageProvider)
    .where(
      and(eq(storageProvider.isActive, true), isNull(storageProvider.userId)),
    )

  if (providers.length === 0) {
    throw new Error(
      'No storage providers configured. Please add one in the admin settings.',
    )
  }

  const usageRows = await db
    .select({
      providerId: file.providerId,
      usedBytes: sql<number>`COALESCE(SUM(${file.sizeInBytes}), 0)`,
    })
    .from(file)
    .where(and(eq(file.isDeleted, false), isNotNull(file.providerId)))
    .groupBy(file.providerId)
  const usageByProvider = new Map(
    usageRows.map((row) => [row.providerId ?? '', row.usedBytes]),
  )

  const eligible = providers
    .map((provider) => {
      const used = usageByProvider.get(provider.id) ?? 0
      const available = provider.storageLimitBytes - used
      return { provider, available }
    })
    .filter(
      (item) =>
        item.available >= incomingFileSize &&
        item.provider.fileSizeLimitBytes >= incomingFileSize,
    )
    .sort((a, b) => b.available - a.available)

  if (eligible.length === 0) {
    throw new Error(
      'No available storage provider can accept this file size and capacity',
    )
  }

  return fromProviderRow(eligible[0].provider)
}
