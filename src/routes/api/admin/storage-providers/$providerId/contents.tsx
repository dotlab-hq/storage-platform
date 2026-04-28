import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { isAdminMiddleware } from '@/middlewares/isAdmin'
import { listProviderContents } from '@/lib/storage-providers/contents'

const AdminProviderContentsSchema = z.object({
  prefix: z.string().optional(),
  maxKeys: z.coerce.number().int().min(1).max(1000).optional(),
})

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
    middleware: [isAdminMiddleware],
    handlers: {
      GET: async ({ context, request, params }) => {
        try {
          // Admin already verified by middleware; user is in context
          const query = AdminProviderContentsSchema.parse({
            prefix:
              new URL(request.url).searchParams.get('prefix') ?? undefined,
            maxKeys:
              new URL(request.url).searchParams.get('maxKeys') ?? undefined,
          })

          const contents = await listProviderContents({
            providerId: params.providerId,
            prefix: query.prefix,
            maxKeys: query.maxKeys,
          })

          return Response.json(contents)
        } catch (error) {
          const message =
            error instanceof z.ZodError
              ? 'Invalid request parameters'
              : error instanceof Error
                ? error.message
                : 'Failed to load provider contents'
          const status = error instanceof z.ZodError ? 400 : 500
          return Response.json({ error: message }, { status })
        }
      },
    },
  },
})
