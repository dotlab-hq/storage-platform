import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { listFolderItems, getFolderBreadcrumbs } from '@/lib/storage-queries'
import { mapBreadcrumbs } from '@/hooks/storage-data-mapper'

const AdminUserItemsQuerySchema = z.object({
  folderId: z.string().nullable().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional(),
})

function errorToMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? 'Invalid request'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Failed to load user items'
}

export const Route = createFileRoute('/api/admin/users/$userId/folder-items')({
  component: () => null,
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const currentUser = await getAuthenticatedUser()
          if (!currentUser.isAdmin) {
            return Response.json(
              { error: 'Admin access is required to view user items' },
              { status: 403 },
            )
          }

          const query = AdminUserItemsQuerySchema.parse(
            Object.fromEntries(new URL(request.url).searchParams.entries()),
          )

          const targetUserId = params.userId
          const folderId = query.folderId ?? null
          const page = query.page ?? 1
          const limit = query.limit ?? 100

          const rawItems = await listFolderItems(
            targetUserId,
            folderId,
            limit,
            page,
          )

          let breadcrumbs: { id: string; name: string }[] = []
          if (folderId) {
            breadcrumbs = await getFolderBreadcrumbs(targetUserId, folderId)
          }

          const mappedBreadcrumbs = mapBreadcrumbs(breadcrumbs)

          const totalCount = rawItems.folders.length + rawItems.files.length
          const hasMore = totalCount >= limit
          const nextPage = hasMore ? page + 1 : null

          return Response.json({
            userId: targetUserId,
            folderId,
            folders: rawItems.folders,
            files: rawItems.files,
            breadcrumbs: mappedBreadcrumbs,
            hasMore,
            nextPage,
          })
        } catch (error) {
          const message = errorToMessage(error)
          const status =
            message === 'UNAUTHORIZED'
              ? 401
              : message === 'User not found'
                ? 404
                : message?.toLowerCase().includes('admin access')
                  ? 403
                  : error instanceof z.ZodError
                    ? 400
                    : 500

          return Response.json({ error: message }, { status })
        }
      },
    },
  },
})
