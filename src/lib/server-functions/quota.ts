import { createServerFn } from '@tanstack/react-start'
import { apiAuthMiddleware } from '@/middlewares/api-auth'

export const getUserQuotaSnapshotFn = createServerFn({ method: 'GET' })
  .middleware([apiAuthMiddleware])
  .handler(async ({ context }) => {
    const currentUser = context.user
    const { getUserQuotaSnapshotByUserId } = await import('./quota.server')
    return getUserQuotaSnapshotByUserId(currentUser.id)
  })
