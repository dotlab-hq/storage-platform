import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { apiAuthMiddleware } from '@/middlewares/api-auth'
import { createServiceContext } from '@/lib/services/base-service'
import { StorageService } from '@/lib/services/storage-service'

const CreateFolderSchema = z.object({
  name: z.string().min(1),
  parentFolderId: z.string().nullable().optional(),
})

export const createFolderFn = createServerFn({ method: 'POST' })
  .use(apiAuthMiddleware)
  .inputValidator(CreateFolderSchema)
  .handler(async ({ data, context }) => {
    const { user } = context
    const ctx = await createServiceContext()
    const service = new StorageService(ctx)
    const folder = await service.createFolder({
      name: data.name,
      parentFolderId: data.parentFolderId ?? null,
    })

    const { invalidateFolderCache } = await import('@/lib/cache-invalidation')
    await invalidateFolderCache(user.id, data.parentFolderId ?? null)

    return { folder }
  })
