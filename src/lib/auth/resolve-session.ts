import { auth } from '@/lib/auth'
import { isAdminRole, normalizeUserRole } from '@/lib/authz'
import { resolveTinySessionFromHeaders } from '@/lib/tiny-session'

/**
 * Who is making this request? Shared by every auth middleware and by
 * `getCurrentUserFn`, so there is one definition of "signed in".
 *
 * A request is authenticated either by a better-auth session cookie or by a
 * "tiny session" (short-lived device token, possibly read-only).
 */
export type ResolvedSession = {
  session: { id: string; expiresAt: Date }
  user: {
    id: string
    email: string
    name: string | null
    image: string | null
    role: string
    isAdmin: boolean
  }
  tinySession?: {
    permission: 'read' | 'read-write'
    expiresAt: Date
  }
}

export async function resolveSession(
  headers: Headers,
): Promise<ResolvedSession | null> {
  const session = await auth.api.getSession({ headers }).catch(() => null)
  if (session?.user) {
    const role = normalizeUserRole(session.user.role)
    return {
      session: { id: session.session.id, expiresAt: session.session.expiresAt },
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image ?? null,
        role,
        isAdmin: isAdminRole(role),
      },
    }
  }

  const tinySession = await resolveTinySessionFromHeaders(headers)
  if (!tinySession) return null

  return {
    session: { id: tinySession.sessionId, expiresAt: tinySession.expiresAt },
    user: {
      id: tinySession.user.id,
      email: tinySession.user.email,
      name: tinySession.user.name,
      image: null,
      role: tinySession.user.role,
      isAdmin: tinySession.user.isAdmin,
    },
    tinySession: {
      permission: tinySession.permission,
      expiresAt: tinySession.expiresAt,
    },
  }
}
