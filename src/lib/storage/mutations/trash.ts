import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser, requireWritePermission } from '@/lib/server-auth'
import { listTrashItems } from '@/lib/trash-queries'
import { restoreItems, permanentDeleteItems } from '@/lib/trash-mutations'

export const listTrashItemsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getAuthenticatedUser()
    const items = await listTrashItems(user.id)
    return { items }
  },
)

const TrashActionSchema = z.object({
  itemIds: z.array(z.string()),
  itemTypes: z.array(z.enum(['file', 'folder'])),
})

export const restoreTrashItemsFn = createServerFn({ method: 'POST' })
  .inputValidator(TrashActionSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    requireWritePermission(user)
    if (data.itemIds.length !== data.itemTypes.length) {
      throw new Error('Mismatched ids/types arrays')
    }
    const result = await restoreItems(user.id, data.itemIds, data.itemTypes)
    return result
  })

export const permanentDeleteTrashItemsFn = createServerFn({ method: 'POST' })
  .inputValidator(TrashActionSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
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
  })
