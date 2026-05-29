import { createServerFn } from '@tanstack/react-start'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { storageProvider } from '@/db/schema/storage-provider'
import {
  createAdminProviderObjectUrl,
  listAdminProviderContents,
} from '@/lib/admin-provider-browser'
import { apiAuthMiddleware } from '@/middlewares/api-auth'

const UserProviderContentsSchema = z.object({
  providerId: z.string().min(1),
  prefix: z.string().default(''),
  continuationToken: z.string().nullable().optional(),
  maxKeys: z.number().int().min(1).max(1000).default(250),
  search: z.string().optional(),
})

const UserProviderObjectUrlSchema = z.object({
  providerId: z.string().min(1),
  objectKey: z.string().min(1),
})

async function assertUserOwnsProvider(providerId: string, userId: string) {
  const providerRows = await db
    .select({ id: storageProvider.id })
    .from(storageProvider)
    .where(
      and(
        eq(storageProvider.id, providerId),
        eq(storageProvider.userId, userId),
      ),
    )
    .limit(1)

  if (providerRows.length === 0) {
    throw new Error('Storage provider not found')
  }
}

export const getUserProviderContentsFn = createServerFn({
  method: 'POST',
})
  .middleware([apiAuthMiddleware])
  .inputValidator(UserProviderContentsSchema)
  .handler(async ({ data, context }) => {
    await assertUserOwnsProvider(data.providerId, context.user.id)

    return listAdminProviderContents(
      data.providerId,
      data.prefix,
      data.maxKeys,
      data.continuationToken ?? null,
      data.search,
    )
  })

export const getUserProviderObjectUrlFn = createServerFn({
  method: 'POST',
})
  .middleware([apiAuthMiddleware])
  .inputValidator(UserProviderObjectUrlSchema)
  .handler(async ({ data, context }) => {
    await assertUserOwnsProvider(data.providerId, context.user.id)
    const url = await createAdminProviderObjectUrl(
      data.providerId,
      data.objectKey,
    )
    return { url }
  })
