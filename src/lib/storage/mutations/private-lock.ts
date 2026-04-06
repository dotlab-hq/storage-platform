import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { setFolderPrivateLock } from '@/lib/private-lock-mutations'

const PrivateLockSchema = z.object({
  folderId: z.string(),
  isPrivatelyLocked: z.boolean(),
})

export const setFolderPrivateLockFn = createServerFn({ method: 'POST' })
  .inputValidator(PrivateLockSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const folder = await setFolderPrivateLock(
      user.id,
      data.folderId,
      data.isPrivatelyLocked,
    )
    return { folder }
  })
