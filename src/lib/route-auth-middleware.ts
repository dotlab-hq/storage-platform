import { createMiddleware } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'

export type AuthContextSession = {
  session: {
    id: string
    expiresAt: Date
    [key: string]: unknown
  }
  user: {
    id: string
    email: string
    name: string | null
    role: string
    isAdmin: boolean
    [key: string]: unknown
  }
  [key: string]: unknown
}

type AuthContext = {
  auth?: {
    session: AuthContextSession
  }
}

const PUBLIC_REQUEST_PATH_PREFIXES = ['/auth', '/share', '/api/auth']
const PUBLIC_SERVER_FN_FILE_PREFIXES = ['src/routes/auth/', 'src/routes/share/']

function isPublicRequestPath(pathname: string) {
  return PUBLIC_REQUEST_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

function isPublicServerFunction(filename: string) {
  return PUBLIC_SERVER_FN_FILE_PREFIXES.some((prefix) =>
    filename.startsWith(prefix),
  )
}

function isAdminServerFunction(filename: string) {
  return filename.startsWith('src/routes/admin/')
}

async function getAuthContextSession(): Promise<AuthContextSession | null> {
  const { getRequest } = await import('@tanstack/react-start/server')
  const { auth } = await import('@/lib/auth')
  const { isAdminRole, normalizeUserRole } = await import('@/lib/authz')
  const session = await auth.api.getSession({ headers: getRequest().headers })
  if (!session?.user) {
    return null
  }

  const role = normalizeUserRole(session.user.role)

  return {
    ...session,
    user: {
      ...session.user,
      role,
      isAdmin: isAdminRole(role),
    },
  }
}

async function requireAuthContextSession() {
  const session = await getAuthContextSession()
  if (!session) {
    throw redirect({ to: '/auth' })
  }

  return session
}

function requireAdminSession(session: AuthContextSession) {
  if (!session.user.isAdmin) {
    throw new Error('Forbidden: admin access required')
  }

  return session
}

export const authenticatedRouteMiddleware = createMiddleware().server(
  async ({ pathname, next }) => {
    if (isPublicRequestPath(pathname)) {
      return next()
    }

    const session = await requireAuthContextSession()

    return next({
      context: {
        auth: { session },
      },
    })
  },
)

export const adminRouteMiddleware = createMiddleware().server(
  async ({ next }) => {
    const session = requireAdminSession(await requireAuthContextSession())

    return next({
      context: {
        auth: { session },
      },
    })
  },
)

export const authenticatedServerFunctionMiddleware = createMiddleware({
  type: 'function',
}).server((async ({ context, next, serverFnMeta }: any) => {
  if (isPublicServerFunction(serverFnMeta.filename)) {
    return next()
  }

  const existingSession = (context as unknown as AuthContext).auth?.session
  const session = existingSession ?? (await requireAuthContextSession())

  return next({
    context: {
      auth: { session },
    },
  })
}) as any)

export const adminServerFunctionMiddleware = createMiddleware({
  type: 'function',
}).server((async ({ context, next, serverFnMeta }: any) => {
  if (!isAdminServerFunction(serverFnMeta.filename)) {
    return next()
  }

  const existingSession = (context as unknown as AuthContext).auth?.session
  const session = requireAdminSession(
    existingSession ?? (await requireAuthContextSession()),
  )

  return next({
    context: {
      auth: { session },
    },
  })
}) as any)

export async function requireAuthenticatedServerOnlySession() {
  return requireAuthContextSession()
}
