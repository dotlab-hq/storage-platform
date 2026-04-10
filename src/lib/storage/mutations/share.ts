import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser, requireWritePermission } from '@/lib/server-auth'
import {
  createShareLink,
  getShareLink,
  toggleShareLink,
} from '@/lib/share-mutations'

const GetShareSchema = z.object({
  itemId: z.string(),
  itemType: z.enum(['file', 'folder']),
})

export const getShareLinkFn = createServerFn({ method: 'GET' })
  .inputValidator(GetShareSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
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
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    requireWritePermission(user)
    const link = await createShareLink(
      user.id,
      data.itemId,
      data.itemType,
      false,
      Boolean(data.consentedPrivatelyUnlock),
    )
    return { link }
  })

const ToggleShareSchema = z.object({
  linkId: z.string(),
  isActive: z.boolean(),
})

export const toggleShareLinkFn = createServerFn({ method: 'POST' })
  .inputValidator(ToggleShareSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    requireWritePermission(user)
    const link = await toggleShareLink(user.id, data.linkId, data.isActive)
    return { link }
  })
