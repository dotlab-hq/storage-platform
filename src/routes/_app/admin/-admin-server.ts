import { db } from '@/db'
import { file } from '@/db/schema/storage'
import { storageProvider } from '@/db/schema/storage-provider'
import { encryptProviderSecret } from '@/lib/provider-crypto'
import {
  getStorageAdminSummary,
  getUsersWithUsage,
  listProvidersWithUsage,
} from '@/lib/storage-provider-queries'
import { createServerFn } from '@tanstack/react-start'
import { and, count, eq, ne } from 'drizzle-orm'
import { z } from 'zod'
import { UNDETERMINED_PROVIDER_VALUE } from '@/lib/storage-provider-constants'

const SaveProviderSchema = z.object({
  providerId: z.string().min(1).optional(),
  name: z.string().min(2),
  endpoint: z.string().default(''),
  region: z.string().default(''),
  bucketName: z.string().default(''),
  accessKeyId: z.string().default(''),
  secretAccessKey: z.string().default(''),
  storageLimitBytes: z.number().int().positive(),
  fileSizeLimitBytes: z.number().int().positive(),
  proxyUploadsEnabled: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

const ProviderIdSchema = z.object({
  providerId: z.string().min(1),
})

const UpdateProviderAvailabilitySchema = z.object({
  providerId: z.string().min(1),
  isActive: z.boolean(),
})

export const getAdminDashboardDataFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const [summary, providers, users] = await Promise.all([
    getStorageAdminSummary(),
    listProvidersWithUsage(),
    getUsersWithUsage(),
  ])
  return { summary, providers, users }
})

export const saveStorageProviderFn = createServerFn({ method: 'POST' })
  .inputValidator(SaveProviderSchema)
  .handler(async ({ data }) => {
    if (data.fileSizeLimitBytes > data.storageLimitBytes) {
      throw new Error('File-size limit cannot exceed storage limit')
    }

    const trimmedName = data.name.trim()
    if (!trimmedName) {
      throw new Error('Provider name is required')
    }

    const endpoint = data.endpoint.trim() || UNDETERMINED_PROVIDER_VALUE
    const region = data.region.trim() || UNDETERMINED_PROVIDER_VALUE
    const bucketName = data.bucketName.trim() || UNDETERMINED_PROVIDER_VALUE
    const accessKeyId = data.accessKeyId.trim()
    const secretAccessKey = data.secretAccessKey.trim()
    const nextAccessKeyIdEncrypted = accessKeyId
      ? encryptProviderSecret(accessKeyId)
      : UNDETERMINED_PROVIDER_VALUE
    const nextSecretAccessKeyEncrypted = secretAccessKey
      ? encryptProviderSecret(secretAccessKey)
      : UNDETERMINED_PROVIDER_VALUE

    if (data.providerId) {
      const duplicateRows = await db
        .select({ id: storageProvider.id })
        .from(storageProvider)
        .where(
          and(
            eq(storageProvider.name, trimmedName),
            ne(storageProvider.id, data.providerId),
          ),
        )
        .limit(1)
      if (duplicateRows.length > 0) {
        throw new Error('Storage provider name already exists')
      }

      const existingRows = await db
        .select({
          id: storageProvider.id,
          accessKeyIdEncrypted: storageProvider.accessKeyIdEncrypted,
          secretAccessKeyEncrypted: storageProvider.secretAccessKeyEncrypted,
        })
        .from(storageProvider)
        .where(eq(storageProvider.id, data.providerId))
        .limit(1)

      if (existingRows.length === 0) {
        throw new Error('Storage provider not found')
      }

      const existing = existingRows[0]
      const [provider] = await db
        .update(storageProvider)
        .set({
          name: trimmedName,
          endpoint,
          region,
          bucketName,
          // Blank credential fields in the edit form mean "keep existing secret".
          accessKeyIdEncrypted: accessKeyId
            ? nextAccessKeyIdEncrypted
            : existing.accessKeyIdEncrypted,
          secretAccessKeyEncrypted: secretAccessKey
            ? nextSecretAccessKeyEncrypted
            : existing.secretAccessKeyEncrypted,
          storageLimitBytes: data.storageLimitBytes,
          fileSizeLimitBytes: data.fileSizeLimitBytes,
          proxyUploadsEnabled: data.proxyUploadsEnabled,
          isActive: data.isActive,
        })
        .where(eq(storageProvider.id, existing.id))
        .returning({ id: storageProvider.id, name: storageProvider.name })
      return { success: true, provider, operation: 'updated' as const }
    }

    const duplicateRows = await db
      .select({ id: storageProvider.id })
      .from(storageProvider)
      .where(eq(storageProvider.name, trimmedName))
      .limit(1)
    if (duplicateRows.length > 0) {
      throw new Error('Storage provider name already exists')
    }

    const [provider] = await db
      .insert(storageProvider)
      .values({
        name: trimmedName,
        endpoint,
        region,
        bucketName,
        accessKeyIdEncrypted: nextAccessKeyIdEncrypted,
        secretAccessKeyEncrypted: nextSecretAccessKeyEncrypted,
        storageLimitBytes: data.storageLimitBytes,
        fileSizeLimitBytes: data.fileSizeLimitBytes,
        proxyUploadsEnabled: data.proxyUploadsEnabled,
        isActive: data.isActive,
      })
      .returning({ id: storageProvider.id, name: storageProvider.name })
    return { success: true, provider, operation: 'created' as const }
  })

export const setStorageProviderAvailabilityFn = createServerFn({
  method: 'POST',
})
  .inputValidator(UpdateProviderAvailabilitySchema)
  .handler(async ({ data }) => {
    const providers = await db
      .update(storageProvider)
      .set({ isActive: data.isActive })
      .where(eq(storageProvider.id, data.providerId))
      .returning({
        id: storageProvider.id,
        isActive: storageProvider.isActive,
      })
    if (providers.length === 0) {
      throw new Error('Storage provider not found')
    }
    const provider = providers[0]
    return { success: true, provider }
  })

export const deleteStorageProviderFn = createServerFn({ method: 'POST' })
  .inputValidator(ProviderIdSchema)
  .handler(async ({ data }) => {
    const [inUseRow] = await db
      .select({ count: count() })
      .from(file)
      .where(
        and(eq(file.providerId, data.providerId), eq(file.isDeleted, false)),
      )
    if (inUseRow.count > 0) {
      throw new Error(
        'Storage provider cannot be deleted while files are still stored in it',
      )
    }
    const deleted = await db
      .delete(storageProvider)
      .where(eq(storageProvider.id, data.providerId))
      .returning({ id: storageProvider.id })
    if (deleted.length === 0) {
      throw new Error('Storage provider not found')
    }
    return { success: true }
  })
