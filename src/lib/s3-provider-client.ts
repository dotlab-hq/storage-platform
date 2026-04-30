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

// Default region to use when provider configuration does not specify a concrete AWS region.
// Some providers (e.g., Backblaze B2) use "auto" to indicate the SDK should determine the region.
// The S3 client, however, requires a valid region string. We map "auto" to this default.
const DEFAULT_S3_REGION = 'auto'
const INVALID_REGION_SENTINELS = new Set( [
  '',
  UNDETERMINED_PROVIDER_VALUE,
  'pending',
  'null',
  'undefined',
  'bucket',
] )

async function loadDb() {
  const { db } = await import( '@/db' )
  return db
}

function safeTrim( value: string | null | undefined ): string {
  return ( value ?? '' ).replace( /^["']|["']$/g, '' ).trim()
}

function fromProviderRow( row: ProviderRow ): ProviderClientConfig {
  // Access Key ID: must be in DB
  const accessKeyId = safeTrim( decryptProviderSecret( row.accessKeyIdEncrypted ) )

  // Secret Access Key: must be in DB
  const secretAccessKey = safeTrim(
    decryptProviderSecret( row.secretAccessKeyEncrypted ),
  )

  // Region: if row.region is empty/undetermined, throw error
  const rawRegion = safeTrim( row.region )
  console.log(
    '[fromProviderRow] Raw region from DB:',
    JSON.stringify( rawRegion ),
  )

  // If the region is empty or marked as a sentinel value, fall back to the default.
  // Additionally, treat "auto" as a special case that should resolve to the default region.
  let region: string
  if (
    !rawRegion ||
    rawRegion.length === 0 ||
    INVALID_REGION_SENTINELS.has( rawRegion.toLowerCase() )
  ) {
    console.warn(
      `[fromProviderRow] Provider "${row.name}" missing region, using default ${DEFAULT_S3_REGION}`,
    )
    region = DEFAULT_S3_REGION
  } else if ( rawRegion.toLowerCase() === 'auto' ) {
    // "auto" is a common placeholder for providers that determine region automatically.
    region = DEFAULT_S3_REGION
  } else {
    region = rawRegion
  }
  console.log( '[fromProviderRow] Resolved region:', region )

  // Endpoint: must be in DB
  const endpoint = safeTrim( row.endpoint )

  if ( !accessKeyId || !secretAccessKey || !endpoint ) {
    const missing: string[] = []
    if ( !accessKeyId ) missing.push( 'accessKeyId' )
    if ( !secretAccessKey ) missing.push( 'secretAccessKey' )
    if ( !endpoint ) missing.push( 'endpoint' )
    throw new Error(
      `Storage provider "${row.name}" is missing required credentials: ${missing.join( ', ' )}`,
    )
  }

  console.log( '[fromProviderRow] Creating S3 client:', {
    providerId: row.id,
    providerName: row.name,
    bucketName: row.bucketName,
    region,
    endpoint,
  } )

  let client: S3Client
  try {
    client = new S3Client( {
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
    } )
  } catch ( error ) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(
      `Failed to create S3 client for provider "${row.name}": ${message}. ` +
      `Check region (${region}) and endpoint (${endpoint}) configuration.`,
    )
  }

  return {
    providerId: row.id,
    providerName: row.name,
    bucketName: row.bucketName,
    endpoint,
    proxyUploadsEnabled: row.proxyUploadsEnabled,
    client,
  }
}

export async function getProviderClientById(
  providerId: string | null,
): Promise<ProviderClientConfig> {
  console.log( '[ProviderClient] Getting client for providerId:', providerId )
  const db = await loadDb()
  if ( !providerId ) {
    throw new Error( 'Provider ID is required' )
  }
  const providerRows = await db
    .select()
    .from( storageProvider )
    .where( eq( storageProvider.id, providerId ) )
    .limit( 1 )
  if ( providerRows.length === 0 ) {
    throw new Error( 'Storage provider not found' )
  }
  const provider = providerRows[0]
  console.log( '[ProviderClient] Found provider:', provider.id, provider.name )
  return fromProviderRow( provider )
}

export async function getSystemProviderClientById(
  providerId: string,
): Promise<ProviderClientConfig> {
  const db = await loadDb()
  const providerRows = await db
    .select()
    .from( storageProvider )
    .where(
      and( eq( storageProvider.id, providerId ), isNull( storageProvider.userId ) ),
    )
    .limit( 1 )

  if ( providerRows.length === 0 ) {
    throw new Error( 'Storage provider not found' )
  }

  return fromProviderRow( providerRows[0] )
}

export async function resolveProviderId(
  providerId: string | null | undefined,
): Promise<string | null> {
  const db = await loadDb()
  if ( !providerId ) {
    throw new Error( 'Provider ID is required' )
  }

  const providerRows = await db
    .select( { id: storageProvider.id } )
    .from( storageProvider )
    .where(
      and(
        eq( storageProvider.id, providerId ),
        isNull( storageProvider.userId ),
        eq( storageProvider.isActive, true ),
      ),
    )
    .limit( 1 )

  if ( providerRows.length === 0 ) {
    throw new Error( 'Only active system providers can be used for uploads' )
  }

  return providerId
}

export async function selectProviderForUpload(
  incomingFileSize: number,
  _userId: string,
): Promise<ProviderClientConfig> {
  const db = await loadDb()
  const providers = await db
    .select()
    .from( storageProvider )
    .where(
      and( eq( storageProvider.isActive, true ), isNull( storageProvider.userId ) ),
    )

  if ( providers.length === 0 ) {
    throw new Error(
      'No storage providers configured. Please add one in the admin settings.',
    )
  }

  const usageRows = await db
    .select( {
      providerId: file.providerId,
      usedBytes: sql<number>`COALESCE(SUM(${file.sizeInBytes}), 0)`,
    } )
    .from( file )
    .where(
      and(
        eq( file.isDeleted, false ),
        eq( file.isTrashed, false ),
        isNotNull( file.providerId ),
      ),
    )
    .groupBy( file.providerId )
  const usageByProvider = new Map(
    usageRows.map( ( row ) => [row.providerId ?? '', row.usedBytes] ),
  )

  const eligible = providers
    .map( ( provider ) => {
      const used = usageByProvider.get( provider.id ) ?? 0
      const available = provider.storageLimitBytes - used
      return { provider, available }
    } )
    .filter(
      ( item ) =>
        item.available >= incomingFileSize &&
        item.provider.fileSizeLimitBytes >= incomingFileSize,
    )
    .sort( ( a, b ) => b.available - a.available )

  if ( eligible.length === 0 ) {
    throw new Error(
      'No available storage provider can accept this file size and capacity',
    )
  }

  return fromProviderRow( eligible[0].provider )
}
