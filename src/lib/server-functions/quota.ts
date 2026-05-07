import { createServerFn } from '@tanstack/react-start'
import { apiAuthMiddleware } from '@/middlewares/api-auth'

export const getUserQuotaSnapshotFn = createServerFn({ method: 'GET' })
  .use(apiAuthMiddleware)
  .handler(async ({ context }) => {
    const currentUser = context.user
    const { getUserQuotaSnapshotByUserId } = await import('./quota.server')
    return getUserQuotaSnapshotByUserId(currentUser.id)
  })
