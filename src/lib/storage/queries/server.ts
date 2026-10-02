import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getFolderBreadcrumbs } from '@/lib/storage-queries'
import { getTimeOrderedFolderItems } from './folder-items'
import { touchFolderOpenedFn } from '@/lib/storage/mutations/touch'
import { apiAuthMiddleware } from '@/middlewares/api-auth'

const FolderItemsSchema = z.object({
  folderId: z.string().nullable().optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(100),
})

export const getFolderItemsFn = createServerFn({ method: 'GET' })
  .middleware([apiAuthMiddleware])
  .inputValidator(FolderItemsSchema)
  .handler(async ({ data, context }) => {
    const user = context.user
    const folderId = data.folderId ?? null
    const items = await getTimeOrderedFolderItems(
      context,
      folderId,
      data.page,
      data.limit,
    )

    let breadcrumbs: { id: string; name: string }[] = []
    if (folderId) {
      breadcrumbs = await getFolderBreadcrumbs(user.id, folderId)
      void touchFolderOpenedFn({ data: { folderId } }).catch(() => {})
    }

    // Not cached in KV on purpose: KV is eventually consistent, so a cached
    // listing could resurrect items right after a delete/rename/move.
    return { ...items, breadcrumbs }
  })

export const getAllFoldersFn = createServerFn({ method: 'GET' })
  .middleware([apiAuthMiddleware])
  .handler(async ({ context }) => {
    const user = context.user
    const { getAllFolders } = await import('@/lib/storage-queries')
    const folders = await getAllFolders(user.id)
    return { folders }
  })

const SearchItemsSchema = z.object({ query: z.string() })

export const searchItemsFn = createServerFn({ method: 'GET' })
  .middleware([apiAuthMiddleware])
  .inputValidator(SearchItemsSchema)
  .handler(async ({ data, context }) => {
    const user = context.user
    const { searchItems } = await import('@/lib/storage-queries')
    if (!data.query || data.query.trim().length === 0) {
      return { folders: [], files: [] }
    }
    const results = await searchItems(user.id, data.query.trim())
    return results
  })
