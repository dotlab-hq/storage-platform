import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createNewFolder } from '@/lib/storage-server'
import { getAuthenticatedUser } from '@/lib/server-auth'

const CreateFolderSchema = z.object({
  name: z.string().min(1),
  parentFolderId: z.string().nullable().optional(),
})

export const createFolderFn = createServerFn({ method: 'POST' })
  .inputValidator(CreateFolderSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const folder = await createNewFolder({
      userId: user.id,
      name: data.name,
      parentFolderId: data.parentFolderId ?? null,
    })
    return { folder }
  })
