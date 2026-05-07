import { createFileRoute } from '@tanstack/react-router'
import { handleProxyDownloadRange } from '@/lib/download-proxy-server'
import { apiAuthMiddleware } from '@/middlewares/api-auth'

export const Route = createFileRoute('/api/storage/download/proxy')({
  server: {
    middleware: [apiAuthMiddleware],
    handlers: {
      GET: async ({ request, context }) => {
        try {
          const { user } = context
          return handleProxyDownloadRange(request, user.id)
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to download file'
          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
  },
})
