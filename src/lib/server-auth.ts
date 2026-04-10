import { auth } from '@/lib/auth'
import { getRequest } from '@tanstack/react-start/server'
import { notFound, redirect } from '@tanstack/react-router'
import { isAdminRole, normalizeUserRole } from '@/lib/authz'
import { resolveTinySessionFromHeaders } from '@/lib/tiny-session'
import type { UserRole } from '@/lib/authz'
import type { user } from '@/db/schema/auth-schema'

type AuthUser = typeof user.$inferSelect
export type AuthenticatedUser = Pick<AuthUser, 'id' | 'email' | 'name'> & {
  role: UserRole
  isAdmin: boolean
  tinySessionPermission?: 'read' | 'read-write'
}

function shouldRedirectToAuth(request: Request): boolean {
  const secFetchDest = request.headers.get('sec-fetch-dest')
  if (secFetchDest === 'document') {
    return true
  }

  const acceptHeader = request.headers.get('accept') ?? ''
  const acceptsHtml = acceptHeader.includes('text/html')
  const acceptsJson = acceptHeader.includes('application/json')
  return acceptsHtml && !acceptsJson
}

function throwUnauthenticated(request: Request): never {
  if (shouldRedirectToAuth(request)) {
    throw redirect({ to: '/auth' })
  }
  throw new Error('UNAUTHORIZED')
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const request = getRequest()
  const headers = request.headers

  let session: Awaited<ReturnType<typeof auth.api.getSession>> | null = null
  try {
    session = await auth.api.getSession({ headers })
  } catch {
    session = null
  }

  if (!session?.user) {
    const tinySession = await resolveTinySessionFromHeaders(headers)
    if (!tinySession) {
      throwUnauthenticated(request)
    }
    return {
      id: tinySession.user.id,
      email: tinySession.user.email,
      name: tinySession.user.name,
      role: normalizeUserRole(tinySession.user.role),
      isAdmin: tinySession.user.isAdmin,
      tinySessionPermission: tinySession.permission,
    }
  }

  const role = normalizeUserRole(session.user.role)
  const isAdmin = isAdminRole(role)
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role,
    isAdmin,
  }
}

export async function requireAdminUser(): Promise<AuthenticatedUser> {
  const currentUser = await getAuthenticatedUser()
  if (!currentUser.isAdmin) {
    throw notFound()
  }
  return currentUser
}

export async function requireAuthenticatedServerOnlySession(): Promise<void> {
  await getAuthenticatedUser()
}

export function requireWritePermission(user: AuthenticatedUser): void {
  if (user.tinySessionPermission === 'read') {
    throw new Error('You have read-only access and cannot perform this action')
  }
}
