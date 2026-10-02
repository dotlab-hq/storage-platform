import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { resolveSession } from '@/lib/auth/resolve-session'

/** Page middleware: redirects anonymous visitors to /auth. */
export const isAuthenticatedMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const resolved = await resolveSession(request.headers)
    if (!resolved) throw redirect({ to: '/auth' })
    return next({ context: resolved })
  },
)
