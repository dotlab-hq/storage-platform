'use server'

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { listAdminProviderContents } from '@/lib/admin-provider-browser'
import { isAdminMiddleware } from '@/middlewares/isAdmin'

const AdminProviderContentsSchema = z.object({
  providerId: z.string().min(1),
  prefix: z.string().default(''),
  continuationToken: z.string().nullable().optional(),
  maxKeys: z.number().int().min(1).max(1000).default(250),
  search: z.string().optional(),
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
