import { createServerFn } from '@tanstack/react-start'
export * from './-admin-provider-save'

import { db } from '@/db'
import { file } from '@/db/schema/storage'
import { storageProvider } from '@/db/schema/storage-provider'
import { and, count, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { requireAdminUser } from '@/lib/server-auth'
import {
  getStorageAdminSummary,
  getUsersWithUsage,
  listProvidersWithUsage,
} from '@/lib/storage-provider-queries'
import { logActivity } from '@/lib/activity'

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
  await requireAdminUser()
  const [summary, providers, users] = await Promise.all([
    getStorageAdminSummary(),
    listProvidersWithUsage(),
    getUsersWithUsage(),
  ])
  return { summary, providers, users }
})

export const getAdminSummaryFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  await requireAdminUser()
  return getStorageAdminSummary()
})

export const getAdminProvidersFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  await requireAdminUser()
  return listProvidersWithUsage()
})

export const getAdminUsersFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  await requireAdminUser()
  return getUsersWithUsage()
})

export const setStorageProviderAvailabilityFn = createServerFn({
  method: 'POST',
})
  .inputValidator(UpdateProviderAvailabilitySchema)
  .handler(async ({ data }) => {
    const adminUser = await requireAdminUser()
    try {
      const providers = await db
        .update(storageProvider)
        .set({ isActive: data.isActive })
        .where(
          and(
            eq(storageProvider.id, data.providerId),
            isNull(storageProvider.userId),
          ),
        )
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
  .handler(async ({ data }) => {
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
        .where(
          and(
            eq(storageProvider.id, data.providerId),
            isNull(storageProvider.userId),
          ),
        )
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
