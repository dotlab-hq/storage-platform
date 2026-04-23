import { db } from '@/db'
import { file } from '@/db/schema/storage'
import { storageProvider } from '@/db/schema/storage-provider'
import { user } from '@/db/schema/auth-schema'
import { encryptProviderSecret } from '@/lib/provider-crypto'
import { requireAdminUser } from '@/lib/server-auth'
import {
  getStorageAdminSummary,
  getUsersWithUsage,
  listProvidersWithUsage,
} from '@/lib/storage-provider-queries'
import { createServerFn } from '@tanstack/react-start'
import { and, count, eq, ne } from 'drizzle-orm'
import { z } from 'zod'
import { UNDETERMINED_PROVIDER_VALUE } from '@/lib/storage-provider-constants'
import { logActivity } from '@/lib/activity'

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

const UpdateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.string().nullable().optional(),
  isAdmin: z.boolean().optional(),
  banned: z.boolean().optional(),
})

export const getAdminDashboardDataFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  await requireAdminUser()
  const [summary, providers, users] = await Promise.all([
    getStorageAdminSummary(),
    listProvidersWithUsage(),
    getUsersWithUsage(),
  ])
  return { summary, providers, users }
})

export const saveStorageProviderFn = createServerFn({ method: 'POST' })
  .inputValidator(SaveProviderSchema)
  .handler(async ({ data, context }) => {
    const adminUser = await requireAdminUser()
    try {
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

      let provider
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
        const [updatedProvider] = await db
          .update(storageProvider)
          .set({
            name: trimmedName,
            endpoint,
            region,
            bucketName,
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
        provider = updatedProvider
      } else {
        const duplicateRows = await db
          .select({ id: storageProvider.id })
          .from(storageProvider)
          .where(eq(storageProvider.name, trimmedName))
          .limit(1)
        if (duplicateRows.length > 0) {
          throw new Error('Storage provider name already exists')
        }

        const [insertedProvider] = await db
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

export const setStorageProviderAvailabilityFn = createServerFn({
  method: 'POST',
})
  .inputValidator(UpdateProviderAvailabilitySchema)
  .handler(async ({ data, context }) => {
    const adminUser = await requireAdminUser()
    try {
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

      await logActivity({
        userId: adminUser.id,
        eventType: 'provider_toggle',
        resourceType: 'provider',
        resourceId: provider.id,
        tags: ['Providers', 'Admin'],
        meta: { isActive: data.isActive },
      })

      return { success: true, provider }
    } catch (error) {
      await logActivity({
        userId: adminUser.id,
        eventType: 'provider_toggle',
        tags: ['Providers', 'Admin'],
        meta: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  })

export const deleteStorageProviderFn = createServerFn({ method: 'POST' })
  .inputValidator(ProviderIdSchema)
  .handler(async ({ data, context }) => {
    const adminUser = await requireAdminUser()
    try {
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

      await logActivity({
        userId: adminUser.id,
        eventType: 'provider_delete',
        resourceType: 'provider',
        resourceId: data.providerId,
        tags: ['Providers', 'Admin'],
        meta: { success: true },
      })

      return { success: true }
    } catch (error) {
      await logActivity({
        userId: adminUser.id,
        eventType: 'provider_delete',
        tags: ['Providers', 'Admin'],
        meta: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  })

export const updateUserRoleFn = createServerFn({ method: 'POST' })
  .inputValidator(UpdateUserRoleSchema)
  .handler(async ({ data, context }) => {
    const adminUser = await requireAdminUser()
    try {
      const updates: Record<string, unknown> = {}

      if (data.role !== undefined) {
        updates.role = data.role
      }
      if (data.isAdmin !== undefined) {
        updates.isAdmin = data.isAdmin
      }
      if (data.banned !== undefined) {
        updates.banned = data.banned
      }

      if (Object.keys(updates).length === 0) {
        throw new Error('No fields to update')
      }

      const updated = await db
        .update(user)
        .set(updates)
        .where(eq(user.id, data.userId))
        .returning({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin,
          banned: user.banned,
        })

      if (updated.length === 0) {
        throw new Error('User not found')
      }

      await logActivity({
        userId: adminUser.id,
        eventType: 'user_role_update',
        resourceType: 'user',
        resourceId: data.userId,
        tags: ['Admin'],
        meta: { updates, success: true },
      })

      return { success: true, user: updated[0] }
    } catch (error) {
      await logActivity({
        userId: adminUser.id,
        eventType: 'user_role_update',
        tags: ['Admin'],
        meta: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  })
