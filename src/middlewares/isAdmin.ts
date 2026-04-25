import { isAdminRole, normalizeUserRole } from '@/lib/authz'
import { loadAuth } from '@/lib/auth-loader'
import { resolveTinySessionFromHeaders } from '@/lib/tiny-session'
import { createMiddleware, notFound, redirect } from '@tanstack/react-start'

type AdminSessionContext = {
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

async function resolveAdminSession(
  headers: Headers,
): Promise<AdminSessionContext | null> {
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

export const isAdminMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const resolved = await resolveAdminSession(request.headers)
    if (!resolved) {
      throw redirect({ to: '/auth' })
    }

    if (!resolved.user.isAdmin) {
      throw notFound()
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
