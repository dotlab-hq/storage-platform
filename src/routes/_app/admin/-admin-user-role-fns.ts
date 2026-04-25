import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { user } from '@/db/schema/auth-schema'
import { requireAdminUser } from '@/lib/server-auth'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { logActivity } from '@/lib/activity'

const UpdateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.string().nullable().optional(),
  isAdmin: z.boolean().optional(),
  banned: z.boolean().optional(),
})

export const updateUserRoleFn = createServerFn({ method: 'POST' })
  .inputValidator(UpdateUserRoleSchema)
  .handler(async ({ data }) => {
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

const BanUsersSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1),
  banned: z.boolean(),
  banReason: z.string().optional(),
})

export const banUsersFn = createServerFn({ method: 'POST' })
  .inputValidator(BanUsersSchema)
  .handler(async ({ data }) => {
    const adminUser = await requireAdminUser()
    try {
      if (data.userIds.includes(adminUser.id)) {
        throw new Error('Cannot ban yourself')
      }

      const updateData: Record<string, unknown> = {
        banned: data.banned,
      }
      if (data.banReason) {
        updateData.banReason = data.banReason
      }

      await db.update(user).set(updateData).where(eq(user.id, data.userIds[0]))

      await logActivity({
        userId: adminUser.id,
        eventType: data.banned ? 'user_ban' : 'user_unban',
        resourceType: 'user',
        resourceId: data.userIds[0],
        tags: ['Admin'],
        meta: { userIds: data.userIds, banned: data.banned },
      })

      return { success: true, banned: data.banned }
    } catch (error) {
      await logActivity({
        userId: adminUser.id,
        eventType: data.banned ? 'user_ban' : 'user_unban',
        tags: ['Admin'],
        meta: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  })

const DeleteUsersSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1),
})

export const deleteUsersFn = createServerFn({ method: 'POST' })
  .inputValidator(DeleteUsersSchema)
  .handler(async ({ data }) => {
    const adminUser = await requireAdminUser()
    try {
      if (data.userIds.includes(adminUser.id)) {
        throw new Error('Cannot delete your own account')
      }

      const deleted = await db
        .delete(user)
        .where(eq(user.id, data.userIds[0]))
        .returning({ id: user.id })

      if (deleted.length === 0) {
        throw new Error('User not found')
      }

      await logActivity({
        userId: adminUser.id,
        eventType: 'user_delete',
        resourceType: 'user',
        resourceId: data.userIds[0],
        tags: ['Admin'],
        meta: { userIds: data.userIds },
      })

      return { success: true }
    } catch (error) {
      await logActivity({
        userId: adminUser.id,
        eventType: 'user_delete',
        tags: ['Admin'],
        meta: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  })
