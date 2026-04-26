import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { storageProvider } from '@/db/schema/storage-provider'
import { listAdminProviderContents } from '@/lib/admin-provider-browser'
import { getAuthenticatedUser } from '@/lib/server-auth'

const UserProviderContentsSchema = z.object({
  providerId: z.string().min(1),
  prefix: z.string().default(''),
  continuationToken: z.string().nullable().optional(),
  maxKeys: z.number().int().min(1).max(1000).default(250),
  search: z.string().optional(),
})

export const getUserProviderContentsFn = createServerFn({
  method: 'POST',
})
  .inputValidator(UserProviderContentsSchema)
  .handler(async ({ data }) => {
    const currentUser = await getAuthenticatedUser()

    const providerRows = await db
      .select({ id: storageProvider.id })
      .from(storageProvider)
      .where(
        and(
          eq(storageProvider.id, data.providerId),
          eq(storageProvider.userId, currentUser.id),
        ),
      )
      .limit(1)

    if (providerRows.length === 0) {
      throw new Error('Storage provider not found')
    }

    return listAdminProviderContents(
      data.providerId,
      data.prefix,
      data.maxKeys,
      data.continuationToken ?? null,
      data.search,
    )
  })
