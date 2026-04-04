import { createFileRoute } from '@tanstack/react-router'
import { resolveTinySessionFromHeaders } from '@/lib/tiny-session'

export const Route = createFileRoute('/api/qr-auth/session-status')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const tinySession = await resolveTinySessionFromHeaders(request.headers)

        if (!tinySession) {
          return Response.json({ active: false })
        }

        return Response.json({
          active: true,
          permission: tinySession.permission,
          expiresAt: tinySession.expiresAt.toISOString(),
        })
      },
    },
  },
})
