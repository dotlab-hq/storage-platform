import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser, requireWritePermission } from '@/lib/server-auth'
import { setFolderPrivateLock } from '@/lib/private-lock-mutations'
import { withActivityLogging } from '@/lib/activity-logging'

const PrivateLockSchema = z.object({
  folderId: z.string(),
  isPrivatelyLocked: z.boolean(),
})

export const setFolderPrivateLockFn = createServerFn({ method: 'POST' })
  .inputValidator(PrivateLockSchema)
  .handler(async ({ data, context }) => {
    const user = await getAuthenticatedUser()
    return withActivityLogging(
      user.id,
      'folder_lock_toggle',
      {
        resourceType: 'folder',
        resourceId: data.folderId,
        tags: ['Folders'],
        meta: { isPrivatelyLocked: data.isPrivatelyLocked },
      },
      async () => {
        requireWritePermission(user)
        const folder = await setFolderPrivateLock(
          user.id,
          data.folderId,
          data.isPrivatelyLocked,
        )
        return { folder }
      },
    )
  })
