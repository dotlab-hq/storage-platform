import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth.server'
import { handleProxyUploadRequest } from '@/lib/upload-proxy-server'

export const Route = createFileRoute('/api/storage/upload/proxy')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authUser = await getAuthenticatedUser()
          return handleProxyUploadRequest(request, authUser.id)
        } catch (error) {
          const message =
            error instanceof z.ZodError
              ? 'Invalid proxy upload request'
              : error instanceof Error
                ? error.message
                : 'Failed to proxy upload file'
          const status = error instanceof z.ZodError ? 400 : 500
          return Response.json({ error: message }, { status })
        }
      },
    },
  },
})
