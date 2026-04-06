// the middleware will always ensure that the user is authenticated before allowing access further

import { auth } from '@/lib/auth'
import { isAdminRole, normalizeUserRole } from '@/lib/authz'
import { resolveTinySessionFromHeaders } from '@/lib/tiny-session'
import { createMiddleware } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'

type AuthenticatedSessionContext = {
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

async function resolveAuthenticatedSession(
  headers: Headers,
): Promise<AuthenticatedSessionContext | null> {
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

const isAuthenticatedMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const headers = request.headers
    const resolved = await resolveAuthenticatedSession(headers)
    if (!resolved) {
      throw redirect({
        to: '/auth',
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

export { isAuthenticatedMiddleware }
