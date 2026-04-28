import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createNewFolder } from '@/lib/storage-server'
import {
  getAuthenticatedUser,
  requireWritePermission,
} from '@/lib/server-auth.server'

const CreateFolderSchema = z.object({
  name: z.string().min(1),
  parentFolderId: z.string().nullable().optional(),
})

export const createFolderFn = createServerFn({ method: 'POST' })
  .inputValidator(CreateFolderSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    requireWritePermission(user)
    const folder = await createNewFolder({
      userId: user.id,
      name: data.name,
      parentFolderId: data.parentFolderId ?? null,
    })

    const { invalidateFolderCache } = await import('@/lib/cache-invalidation')
    await invalidateFolderCache(user.id, data.parentFolderId ?? null)

    return { folder }
  })
