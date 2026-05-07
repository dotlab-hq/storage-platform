import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { apiAuthMiddleware } from '@/middlewares/api-auth'
import { handleProxyUploadRequest } from '@/lib/upload-proxy-server'

export const Route = createFileRoute('/api/storage/upload/proxy')({
  server: {
    middleware: [apiAuthMiddleware],
    handlers: {
      POST: async ({ request, context }) => {
        try {
          const { user } = context
          return handleProxyUploadRequest(request, user.id)
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
