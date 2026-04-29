import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { user } from '@/db/schema/auth-schema'
import { userStorage } from '@/db/schema/storage'
import { requireAdminUser } from '@/lib/server-auth.server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { DEFAULT_FILE_SIZE_LIMIT_BYTES } from '@/lib/storage-quota-constants'
import { logActivity } from '@/lib/activity'

const UpdateUserStorageLimitSchema = z.object({
  userId: z.string().min(1),
  storageLimitBytes: z.number().int().positive(),
})

const UpdateUserFileSizeLimitSchema = z.object({
  userId: z.string().min(1),
  fileSizeLimitBytes: z.number().int().positive(),
})

export const updateUserStorageLimitFn = createServerFn({ method: 'POST' })
  .inputValidator(UpdateUserStorageLimitSchema)
  .handler(async ({ data }) => {
    const adminUser = await requireAdminUser()
    try {
      const [userRecord] = await db
        .select({
          id: user.id,
          name: user.name,
        })
        .from(user)
        .where(eq(user.id, data.userId))

      if (!userRecord) {
        throw new Error('User not found')
      }

      const [storageRecord] = await db
        .insert(userStorage)
        .values({
          userId: data.userId,
          allocatedStorage: data.storageLimitBytes,
          usedStorage: 0,
          fileSizeLimit: DEFAULT_FILE_SIZE_LIMIT_BYTES,
        })
        .onConflictDoUpdate({
          target: userStorage.userId,
          set: { allocatedStorage: data.storageLimitBytes },
        })
        .returning({
          userId: userStorage.userId,
          allocatedStorage: userStorage.allocatedStorage,
        })

      if (!storageRecord) {
        throw new Error('Failed to update storage limit')
      }

      await logActivity({
        userId: adminUser.id,
        eventType: 'user_storage_limit_update',
        resourceType: 'user',
        resourceId: data.userId,
        tags: ['Admin'],
        meta: { storageLimitBytes: data.storageLimitBytes },
      })

      return {
        success: true,
        user: {
          id: userRecord.id,
          name: userRecord.name,
          storageLimitBytes: storageRecord.allocatedStorage,
        },
      }
    } catch (error) {
      await logActivity({
        userId: adminUser.id,
        eventType: 'user_storage_limit_update',
        tags: ['Admin'],
        meta: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  })

export const updateUserFileSizeLimitFn = createServerFn({ method: 'POST' })
  .inputValidator(UpdateUserFileSizeLimitSchema)
  .handler(async ({ data }) => {
    const adminUser = await requireAdminUser()
    try {
      const [userRecord] = await db
        .select({
          id: user.id,
          name: user.name,
        })
        .from(user)
        .where(eq(user.id, data.userId))

      if (!userRecord) {
        throw new Error('User not found')
      }

      const [storageRecord] = await db
        .insert(userStorage)
        .values({
          userId: data.userId,
          fileSizeLimit: data.fileSizeLimitBytes,
          allocatedStorage: 0,
          usedStorage: 0,
        })
        .onConflictDoUpdate({
          target: userStorage.userId,
          set: { fileSizeLimit: data.fileSizeLimitBytes },
        })
        .returning({
          userId: userStorage.userId,
          fileSizeLimit: userStorage.fileSizeLimit,
        })

      if (!storageRecord) {
        throw new Error('Failed to update file size limit')
      }

      await logActivity({
        userId: adminUser.id,
        eventType: 'user_file_size_limit_update',
        resourceType: 'user',
        resourceId: data.userId,
        tags: ['Admin'],
        meta: { fileSizeLimitBytes: data.fileSizeLimitBytes },
      })

      return {
        success: true,
        user: {
          id: userRecord.id,
          name: userRecord.name,
          fileSizeLimitBytes: storageRecord.fileSizeLimit,
        },
      }
    } catch (error) {
      await logActivity({
        userId: adminUser.id,
        eventType: 'user_file_size_limit_update',
        tags: ['Admin'],
        meta: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  })
