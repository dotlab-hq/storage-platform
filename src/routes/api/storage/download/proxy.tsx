import { createFileRoute } from '@tanstack/react-router'
import { handleProxyDownloadRange } from '@/lib/download-proxy-server'
import { getAuthenticatedUser } from '@/lib/server-auth.server'

export const Route = createFileRoute('/api/storage/download/proxy')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const authUser = await getAuthenticatedUser()
          return handleProxyDownloadRange(request, authUser.id)
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Failed to download file'
          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
  },
})
