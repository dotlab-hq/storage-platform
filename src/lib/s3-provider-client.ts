import { file } from '@/db/schema/storage'
import { storageProvider } from '@/db/schema/storage-provider'
import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm'
import { db } from '@/db'
import {
  fromProviderRow,
  type ProviderClientConfig,
} from '@/lib/s3-provider-client-factory'

export async function getProviderClientById(
  providerId: string | null,
): Promise<ProviderClientConfig> {
  console.log('[ProviderClient] Getting client for providerId:', providerId)
  if (!providerId) {
    throw new Error('Provider ID is required')
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
  console.log('[ProviderClient] Found provider:', provider.id, provider.name)
  return fromProviderRow(provider)
}

export async function getSystemProviderClientById(
  providerId: string,
): Promise<ProviderClientConfig> {
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
  if (!providerId) {
    throw new Error('Provider ID is required')
  }

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

export async function selectProviderForUpload(
  incomingFileSize: number,
  _userId: string,
): Promise<ProviderClientConfig> {
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
    .where(
      and(
        eq(file.isDeleted, false),
        eq(file.isTrashed, false),
        isNotNull(file.providerId),
      ),
    )
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
