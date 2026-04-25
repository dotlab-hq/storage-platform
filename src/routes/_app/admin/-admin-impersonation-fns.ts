import { requireAdminUser, getAuthenticatedUser } from '@/lib/server-auth'
import { loadAuth } from '@/lib/auth-loader'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { logActivity } from '@/lib/activity'
import { getRequest } from '@tanstack/react-start/server'

const ImpersonateUserSchema = z.object({
  userId: z.string().min(1),
})

export const impersonateUserFn = createServerFn({ method: 'POST' })
  .inputValidator(ImpersonateUserSchema)
  .handler(async ({ data }) => {
    const adminUser = await requireAdminUser()
    try {
      if (data.userId === adminUser.id) {
        throw new Error('Cannot impersonate yourself')
      }

      const auth = await loadAuth()
      const request = getRequest()
      const headers = request.headers

      const result = await auth.api.impersonateUser({
        headers,
        body: { userId: data.userId },
      })

      await logActivity({
        userId: adminUser.id,
        eventType: 'user_impersonate',
        resourceType: 'user',
        resourceId: data.userId,
        tags: ['Admin'],
        meta: { success: true, impersonatedUserId: data.userId },
      })

      return { success: true, session: result }
    } catch (error) {
      await logActivity({
        userId: adminUser.id,
        eventType: 'user_impersonate',
        tags: ['Admin'],
        meta: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  })

export const stopImpersonationFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const currentUser = await getAuthenticatedUser()
    try {
      const auth = await loadAuth()
      const request = getRequest()
      const headers = request.headers

      await auth.api.stopImpersonating({ headers })

      await logActivity({
        userId: currentUser.id,
        eventType: 'impersonation_stop',
        tags: ['Admin'],
        meta: { success: true },
      })

      return { success: true }
    } catch (error) {
      await logActivity({
        userId: currentUser.id,
        eventType: 'impersonation_stop',
        tags: ['Admin'],
        meta: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  },
)
