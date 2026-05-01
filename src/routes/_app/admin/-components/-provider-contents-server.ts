'use server'

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { listAdminProviderContents } from '@/lib/admin-provider-browser'
import { getAuthenticatedUser } from '@/lib/server-auth.server'
import { isAdminRole, normalizeUserRole } from '@/lib/authz'

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
  .inputValidator(AdminProviderContentsSchema)
  .handler(async ({ data }) => {
    const currentUser = await getAuthenticatedUser()

    // Verify admin status
    const role = normalizeUserRole(currentUser.role)
    if (!isAdminRole(role)) {
      throw new Error('Admin access required')
    }

    return listAdminProviderContents(
      data.providerId,
      data.prefix,
      data.maxKeys,
      data.continuationToken ?? null,
      data.search,
    )
  })
