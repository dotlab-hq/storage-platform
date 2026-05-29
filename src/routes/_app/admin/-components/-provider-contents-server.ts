'use server'

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  createAdminProviderObjectUrl,
  listAdminProviderContents,
} from '@/lib/admin-provider-browser'
import { isAdminMiddleware } from '@/middlewares/isAdmin'

const AdminProviderContentsSchema = z.object({
  providerId: z.string().min(1),
  prefix: z.string().default(''),
  continuationToken: z.string().nullable().optional(),
  maxKeys: z.number().int().min(1).max(1000).default(250),
  search: z.string().optional(),
})

const AdminProviderObjectUrlSchema = z.object({
  providerId: z.string().min(1),
  objectKey: z.string().min(1),
})

export const getAdminProviderContentsFn = createServerFn({
  method: 'POST',
})
  .middleware([isAdminMiddleware])
  .inputValidator(AdminProviderContentsSchema)
  .handler(async ({ data }) => {
    return listAdminProviderContents(
      data.providerId,
      data.prefix,
      data.maxKeys,
      data.continuationToken ?? null,
      data.search,
    )
  })

export const getAdminProviderObjectUrlFn = createServerFn({
  method: 'POST',
})
  .middleware([isAdminMiddleware])
  .inputValidator(AdminProviderObjectUrlSchema)
  .handler(async ({ data }) => {
    const url = await createAdminProviderObjectUrl(
      data.providerId,
      data.objectKey,
    )
    return { url }
  })
