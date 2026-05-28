import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireWritePermission } from '@/lib/server-auth.server'
import { apiAuthMiddleware } from '@/middlewares/api-auth'
import { listTrashItems } from '@/lib/trash-queries'
import { restoreItems, permanentDeleteItems, restoreAllTrash } from '@/lib/trash-mutations'
import { emptyAllTrashForUser } from '@/lib/trash-empty-all'
import { withActivityLogging } from '@/lib/activity-logging'
import { listTrashFolderContents } from '@/lib/trash-queries'

export const listTrashItemsFn = createServerFn({ method: 'GET' })
  .middleware([apiAuthMiddleware])
  .handler(async ({ context }) => {
    const { user } = context
    // Skip logging for GET; page view will cover
    const items = await listTrashItems(user.id)
    return { items }
  })

const TrashActionSchema = z.object({
  itemIds: z.array(z.string()),
  itemTypes: z.array(z.enum(['file', 'folder'])),
})

export const restoreTrashItemsFn = createServerFn({ method: 'POST' })
  .middleware([apiAuthMiddleware])
  .inputValidator(TrashActionSchema)
  .handler(async ({ data, context }) => {
    const { user } = context
    return withActivityLogging(
      user.id,
      'file_restore',
      {
        tags: ['Trash', 'Files'],
        meta: { count: data.itemIds.length },
      },
      async () => {
        requireWritePermission(user)
        if (data.itemIds.length !== data.itemTypes.length) {
          throw new Error('Mismatched ids/types arrays')
        }
        const result = await restoreItems(user.id, data.itemIds, data.itemTypes)
        return result
      },
    )
  })

export const permanentDeleteTrashItemsFn = createServerFn({ method: 'POST' })
  .middleware([apiAuthMiddleware])
  .inputValidator(TrashActionSchema)
  .handler(async ({ data, context }) => {
    const { user } = context
    return withActivityLogging(
      user.id,
      'trash_empty',
      {
        tags: ['Trash'],
        meta: { count: data.itemIds.length },
      },
      async () => {
        requireWritePermission(user)
        if (data.itemIds.length !== data.itemTypes.length) {
          throw new Error('Mismatched ids/types arrays')
        }
        const result = await permanentDeleteItems(
          user.id,
          data.itemIds,
          data.itemTypes,
        )
        return result
      },
    )
  })

export const listTrashFolderContentsFn = createServerFn({ method: 'GET' })
  .middleware([apiAuthMiddleware])
  .inputValidator(
    z.object({
      parentFolderId: z.string().optional().nullable(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { user } = context
    const items = await listTrashFolderContents(
      user.id,
      data.parentFolderId ?? null,
    )
    return { items }
  })

export const restoreAllTrashFn = createServerFn({ method: 'POST' })
  .middleware([apiAuthMiddleware])
  .handler(async ({ context }) => {
    const { user } = context
    return withActivityLogging(
      user.id,
      'file_restore',
      {
        tags: ['Trash', 'Files'],
        meta: { all: true },
      },
      async () => {
        requireWritePermission(user)
        const result = await restoreAllTrash(user.id)
        return result
      },
    )
  })

export const emptyAllTrashFn = createServerFn({ method: 'POST' })
  .middleware([apiAuthMiddleware])
  .handler(async ({ context }) => {
    const { user } = context
    return withActivityLogging(
      user.id,
      'trash_empty',
      {
        tags: ['Trash'],
        meta: { all: true },
      },
      async () => {
        requireWritePermission(user)
        const result = await emptyAllTrashForUser(user.id)
        return result
      },
    )
  })
