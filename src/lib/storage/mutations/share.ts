import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser, requireWritePermission } from '@/lib/server-auth'
import {
  createShareLink,
  getShareLink,
  toggleShareLink,
} from '@/lib/share-mutations'
import { withActivityLogging } from '@/lib/activity-logging'

const GetShareSchema = z.object({
  itemId: z.string(),
  itemType: z.enum(['file', 'folder']),
})

export const getShareLinkFn = createServerFn({ method: 'GET' })
  .inputValidator(GetShareSchema)
  .handler(async ({ data, context }) => {
    const user = await getAuthenticatedUser()
    // Query: maybe log? We'll skip GET for now; could be logged by plugin
    const link = await getShareLink(user.id, data.itemId, data.itemType)
    return { link }
  })

const CreateShareSchema = z.object({
  itemId: z.string(),
  itemType: z.enum(['file', 'folder']),
  consentedPrivatelyUnlock: z.boolean().optional(),
})

export const createShareLinkFn = createServerFn({ method: 'POST' })
  .inputValidator(CreateShareSchema)
  .handler(async ({ data, context }) => {
    const user = await getAuthenticatedUser()
    return withActivityLogging(
      user.id,
      'share_create',
      {
        resourceType: data.itemType,
        resourceId: data.itemId,
        tags: ['Files', 'Share'],
      },
      async () => {
        requireWritePermission(user)
        const link = await createShareLink(
          user.id,
          data.itemId,
          data.itemType,
          false,
          Boolean(data.consentedPrivatelyUnlock),
        )
        return { link }
      },
    )
  })

const ToggleShareSchema = z.object({
  linkId: z.string(),
  isActive: z.boolean(),
})

export const toggleShareLinkFn = createServerFn({ method: 'POST' })
  .inputValidator(ToggleShareSchema)
  .handler(async ({ data, context }) => {
    const user = await getAuthenticatedUser()
    return withActivityLogging(
      user.id,
      'share_access',
      {
        resourceType: 'share',
        resourceId: data.linkId,
        tags: ['Files', 'Share'],
        meta: { isActive: data.isActive },
      },
      async () => {
        requireWritePermission(user)
        const link = await toggleShareLink(user.id, data.linkId, data.isActive)
        return { link }
      },
    )
  })
