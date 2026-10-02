import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { resolveSession } from '@/lib/auth/resolve-session'

/** Page middleware for /auth: already signed-in users go to their files. */
export const isNotAuthenticatedMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const resolved = await resolveSession(request.headers)
    if (resolved) throw redirect({ to: '/' })
    return next()
  },
)
