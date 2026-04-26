import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { listAdminProviderContents } from '@/lib/admin-provider-browser'

const ContentsQuerySchema = z.object({
  prefix: z.string().optional(),
  continuationToken: z.string().optional(),
  maxKeys: z.coerce.number().int().min(1).max(1000).optional(),
  search: z.string().optional(),
})

function getProviderIdFromRequest(requestUrl: string): string {
  const segments = new URL(requestUrl).pathname.split('/').filter(Boolean)
  const providerIndex = segments.indexOf('storage-providers')
  const providerId = segments[providerIndex + 1]
  const tail = segments[providerIndex + 2]

  if (!providerId || tail !== 'contents') {
    throw new Error('Invalid provider contents route')
  }

  return decodeURIComponent(providerId)
}

function errorToMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? 'Invalid request'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Failed to load provider contents'
}

export const Route = createFileRoute(
  '/api/admin/storage-providers/$providerId/contents',
)({
  component: () => null,
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const currentUser = await getAuthenticatedUser()
          if (!currentUser.isAdmin) {
            return Response.json(
              { error: 'Admin access is required to view provider contents' },
              { status: 403 },
            )
          }

          const query = ContentsQuerySchema.parse(
            Object.fromEntries(new URL(request.url).searchParams.entries()),
          )
          const providerId = getProviderIdFromRequest(request.url)
          const contents = await listAdminProviderContents(
            providerId,
            query.prefix ?? '',
            query.maxKeys ?? 250,
            query.continuationToken ?? null,
            query.search,
          )

          return Response.json(contents)
        } catch (error) {
          const message = errorToMessage(error)
          const status =
            message === 'UNAUTHORIZED'
              ? 401
              : message === 'Storage provider not found'
                ? 404
                : message === 'Invalid provider contents route'
                  ? 400
                  : message.toLowerCase().includes('admin access')
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
