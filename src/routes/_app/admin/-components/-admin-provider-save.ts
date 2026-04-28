import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { storageProvider } from '@/db/schema/storage-provider'
import { encryptProviderSecret } from '@/lib/provider-crypto'
import { requireAdminUser } from '@/lib/server-auth.server'
import { eq, isNull, and } from 'drizzle-orm'
import { z } from 'zod'
import { UNDETERMINED_PROVIDER_VALUE } from '@/lib/storage-provider-constants'
import { logActivity } from '@/lib/activity'

const SaveProviderSchema = z.object({
  providerId: z.string().min(1).optional(),
  name: z.string().min(2),
  endpoint: z.string().min(1),
  region: z.string().default('auto'),
  bucketName: z.string().default('auto'),
  accessKeyId: z.string().min(1),
  secretAccessKey: z.string().min(1),
  storageLimitBytes: z.number().int().positive(),
  fileSizeLimitBytes: z.number().int().positive(),
  proxyUploadsEnabled: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export const saveStorageProviderFn = createServerFn({ method: 'POST' })
  .inputValidator(SaveProviderSchema)
  .handler(async ({ data }) => {
    const adminUser = await requireAdminUser()
    try {
      if (data.fileSizeLimitBytes > data.storageLimitBytes) {
        throw new Error('File-size limit cannot exceed storage limit')
      }

      const trimmedName = data.name.trim()
      if (!trimmedName) {
        throw new Error('Provider name is required')
      }

      const endpoint = data.endpoint.trim()
      const region = data.region.trim()
      const bucketName = data.bucketName.trim()
      const accessKeyId = data.accessKeyId.trim()
      const secretAccessKey = data.secretAccessKey.trim()

      if (!accessKeyId || !secretAccessKey || !endpoint) {
        throw new Error(
          'Access key ID, secret access key, and endpoint are required',
        )
      }

      let provider: { id: string; name: string } | null = null

      if (data.providerId) {
        const [existing] = await db
          .select()
          .from(storageProvider)
          .where(
            and(
              eq(storageProvider.id, data.providerId),
              isNull(storageProvider.userId),
            ),
          )
          .limit(1)

        if (!existing) {
          throw new Error('Storage provider not found')
        }

        const nextEndpoint = endpoint || existing.endpoint || 'auto'
        const nextRegion = region || existing.region || 'auto'
        const nextBucketName = bucketName || existing.bucketName || 'auto'
        const nextAccessKeyIdEncrypted = accessKeyId
          ? encryptProviderSecret(accessKeyId)
          : existing.accessKeyIdEncrypted
        const nextSecretAccessKeyEncrypted = secretAccessKey
          ? encryptProviderSecret(secretAccessKey)
          : existing.secretAccessKeyEncrypted

        const updatedProvider = await db
          .update(storageProvider)
          .set({
            name: trimmedName,
            endpoint: nextEndpoint,
            region: nextRegion,
            bucketName: nextBucketName,
            accessKeyIdEncrypted: nextAccessKeyIdEncrypted,
            secretAccessKeyEncrypted: nextSecretAccessKeyEncrypted,
            storageLimitBytes: data.storageLimitBytes,
            fileSizeLimitBytes: data.fileSizeLimitBytes,
            proxyUploadsEnabled: data.proxyUploadsEnabled,
            isActive: data.isActive,
          })
          .where(eq(storageProvider.id, existing.id))
          .returning({ id: storageProvider.id, name: storageProvider.name })

        provider = updatedProvider[0]
      } else {
        const nextEndpoint = endpoint || 'auto'
        const nextRegion = region || 'auto'
        const nextBucketName = bucketName || 'auto'
        const nextAccessKeyIdEncrypted = encryptProviderSecret(accessKeyId)
        const nextSecretAccessKeyEncrypted =
          encryptProviderSecret(secretAccessKey)

        const duplicateRows = await db
          .select({ id: storageProvider.id })
          .from(storageProvider)
          .where(
            and(
              eq(storageProvider.name, trimmedName),
              isNull(storageProvider.userId),
            ),
          )
          .limit(1)

        if (duplicateRows.length > 0) {
          throw new Error('Storage provider name already exists')
        }

        const [insertedProvider] = await db
          .insert(storageProvider)
          .values({
            name: trimmedName,
            endpoint: nextEndpoint,
            region: nextRegion,
            bucketName: nextBucketName,
            accessKeyIdEncrypted: nextAccessKeyIdEncrypted,
            secretAccessKeyEncrypted: nextSecretAccessKeyEncrypted,
            storageLimitBytes: data.storageLimitBytes,
            fileSizeLimitBytes: data.fileSizeLimitBytes,
            proxyUploadsEnabled: data.proxyUploadsEnabled,
            isActive: data.isActive,
          })
          .returning({ id: storageProvider.id, name: storageProvider.name })

        provider = insertedProvider
      }

      await logActivity({
        userId: adminUser.id,
        eventType: data.providerId ? 'provider_update' : 'provider_add',
        resourceType: 'provider',
        resourceId: provider.id,
        tags: ['Providers', 'Admin'],
        meta: {
          name: trimmedName,
          operation: data.providerId ? 'updated' : 'created',
        },
      })

      return {
        success: true,
        provider,
        operation: data.providerId ? 'updated' : 'created',
      }
    } catch (error) {
      await logActivity({
        userId: adminUser.id,
        eventType: 'provider_update',
        tags: ['Providers', 'Admin'],
        meta: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  })
