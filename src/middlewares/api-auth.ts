import { createMiddleware } from '@tanstack/react-start'
import { loadAuth } from '@/lib/auth-loader'
import { resolveTinySessionFromHeaders } from '@/lib/tiny-session'
import { isAdminRole, normalizeUserRole } from '@/lib/authz'

type AuthContext = {
  session: {
    id: string
    expiresAt: Date
  }
  user: {
    id: string
    email: string
    name: string | null
    role: string
    isAdmin: boolean
  }
  tinySession?: {
    permission: 'read' | 'read-write'
    expiresAt: Date
  }
}

async function resolveAuthSession(
  headers: Headers,
): Promise<AuthContext | null> {
  const auth = await loadAuth()
  const session = await auth.api.getSession({ headers })
  if (session?.user) {
    const role = normalizeUserRole(session.user.role)
    return {
      session: {
        id: session.session.id,
        expiresAt: session.session.expiresAt,
      },
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role,
        isAdmin: isAdminRole(role),
      },
    }
  }

  const tinySession = await resolveTinySessionFromHeaders(headers)
  if (!tinySession) {
    return null
  }

  return {
    session: {
      id: tinySession.sessionId,
      expiresAt: tinySession.expiresAt,
    },
    user: {
      id: tinySession.user.id,
      email: tinySession.user.email,
      name: tinySession.user.name,
      role: tinySession.user.role,
      isAdmin: tinySession.user.isAdmin,
    },
    tinySession: {
      permission: tinySession.permission,
      expiresAt: tinySession.expiresAt,
    },
  }
}

/**
 * API Authentication Middleware
 *
 * Ensures the user is authenticated for API routes.
 * Returns JSON 401 for unauthenticated requests (instead of redirecting to /auth).
 * Provides user context to handlers.
 */
export const apiAuthMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const resolved = await resolveAuthSession(request.headers)
    if (!resolved) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return next({
      context: {
        session: resolved.session,
        user: resolved.user,
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
    const resolved = await resolveAuthSession(request.headers)
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
        user: resolved.user,
        tinySession: resolved.tinySession,
      },
    })
  },
)
