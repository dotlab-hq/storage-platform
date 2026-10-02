import { createMiddleware } from '@tanstack/react-start'
import { resolveSession } from '@/lib/auth/resolve-session'

/**
 * API Authentication Middleware
 *
 * Ensures the user is authenticated for API routes.
 * Returns JSON 401 for unauthenticated requests (instead of redirecting to /auth).
 * Provides user context to handlers.
 */
export const apiAuthMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const resolved = await resolveSession(request.headers)
    if (!resolved) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return next({
      context: {
        session: resolved.session,
        user: {
          ...resolved.user,
          // Read by requireWritePermission(); read-only device sessions
          // must not be able to mutate anything.
          tinySessionPermission: resolved.tinySession?.permission,
        },
        tinySession: resolved.tinySession,
      },
    })
  },
)

/**
 * API Admin Middleware
 *
 * Ensures the user is authenticated AND is an admin for admin API routes.
 * Returns JSON 401 for unauthenticated, 403 for non-admin.
 */
export const apiAdminMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const resolved = await resolveSession(request.headers)
    if (!resolved) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!resolved.user.isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return next({
      context: {
        session: resolved.session,
        user: {
          ...resolved.user,
          // Read by requireWritePermission(); read-only device sessions
          // must not be able to mutate anything.
          tinySessionPermission: resolved.tinySession?.permission,
        },
        tinySession: resolved.tinySession,
      },
    })
  },
)
