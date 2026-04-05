import { createMiddleware, createServerOnlyFn } from '@tanstack/react-start'
import { notFound, redirect } from '@tanstack/react-router'
import { resolveTinySessionFromHeaders } from '@/lib/tiny-session'

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
  tinySession?: {
    permission: 'read' | 'read-write'
    expiresAt: Date
  }
}

type AuthContext = {
  auth?: {
    session: AuthContextSession
  }
}

const PUBLIC_REQUEST_PATH_PREFIXES = ['/auth', '/hot', '/share', '/api/auth']

const PUBLIC_EXACT_REQUEST_PATHS = [
  '/api/qr-auth/create-offer',
  '/api/qr-auth/poll',
]
const PUBLIC_SERVER_FN_FILE_PREFIXES = ['src/routes/auth/', 'src/routes/share/']

function isPublicRequestPath( pathname: string ) {
  if ( PUBLIC_EXACT_REQUEST_PATHS.includes( pathname ) ) {
    return true
  }

  return PUBLIC_REQUEST_PATH_PREFIXES.some(
    ( prefix ) => pathname === prefix || pathname.startsWith( `${prefix}/` ),
  )
}

function isPublicServerFunction( filename: string ) {
  return PUBLIC_SERVER_FN_FILE_PREFIXES.some( ( prefix ) =>
    filename.startsWith( prefix ),
  )
}

function isAdminServerFunction( filename: string ) {
  return filename.startsWith( 'src/routes/admin/' )
}

const getAuthContextSessionServerOnly = createServerOnlyFn(
  async (): Promise<AuthContextSession | null> => {
    try {
      const { getRequest } = await import( '@tanstack/react-start/server' )
      const { auth } = await import( '@/lib/auth' )
      const { isAdminRole, normalizeUserRole } = await import( '@/lib/authz' )
      const session = await auth.api.getSession( {
        headers: getRequest().headers,
      } )
      if ( !session?.user ) {
        const tinySession = await resolveTinySessionFromHeaders(
          getRequest().headers,
        )
        if ( !tinySession ) {
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

      const role = normalizeUserRole( session.user.role )

      return {
        ...session,
        user: {
          ...session.user,
          role,
          isAdmin: isAdminRole( role ),
        },
      }
    } catch {
      return null
    }
  },
)

async function getAuthContextSession(): Promise<AuthContextSession | null> {
  return getAuthContextSessionServerOnly()
}

async function requireAuthContextSession() {
  const session = await getAuthContextSession()
  if ( !session ) {
    throw redirect( { to: '/auth' } )
  }

  return session
}

function requireAdminSession( session: AuthContextSession ) {
  if ( !session.user.isAdmin ) {
    throw notFound()
  }

  return session
}

export const authenticatedRouteMiddleware = createMiddleware().server(
  async ( { pathname, request, next } ) => {
    if ( isPublicRequestPath( pathname ) ) {
      return next()
    }

    const session = await requireAuthContextSession()

    const method = String( request?.method ?? 'GET' ).toUpperCase()
    const isWriteMethod = !['GET', 'HEAD', 'OPTIONS'].includes( method )
    if (
      session.tinySession?.permission === 'read' &&
      isWriteMethod &&
      pathname.startsWith( '/api/' )
    ) {
      return Response.json(
        { error: 'This tiny session has read-only access.' },
        { status: 403 },
      )
    }

    return next( {
      context: {
        auth: { session },
      },
    } )
  },
)

export const adminRouteMiddleware = createMiddleware().server(
  async ( { next } ) => {
    const session = requireAdminSession( await requireAuthContextSession() )

    return next( {
      context: {
        auth: { session },
      },
    } )
  },
)

export const authenticatedServerFunctionMiddleware = createMiddleware( {
  type: 'function',
} ).server( async ( { context, next } : any) => {
    const serverFnMeta = ( context as { serverFnMeta: { filename: string, method?: string } } ).serverFnMeta ?? {}
  if ( isPublicServerFunction( serverFnMeta.filename ) ) {
    return next()
  }

  const existingSession = ( context as unknown as AuthContext ).auth?.session
  const session = existingSession ?? ( await requireAuthContextSession() )

  const method = String( serverFnMeta?.method ?? 'GET' ).toUpperCase()
  if (
    session.tinySession?.permission === 'read' &&
    method !== 'GET' &&
    method !== 'HEAD' &&
    method !== 'OPTIONS'
  ) {
    throw new Error( 'This tiny session has read-only access.' )
  }

  return next( {
    context: {
      auth: { session },
    },
  } )
} )

export const adminServerFunctionMiddleware = createMiddleware( {
  type: 'function',
} ).server( async ( { context, next } : any) => {
    const serverFnMeta = ( context as { serverFnMeta: { filename: string, method?: string } } ).serverFnMeta ?? {}
  if ( !isAdminServerFunction( serverFnMeta.filename ) ) {
    return next()
  }

  const existingSession = ( context as unknown as AuthContext ).auth?.session
  const session = requireAdminSession(
    existingSession ?? ( await requireAuthContextSession() ),
  )

  return next( {
    context: {
      auth: { session },
    },
  } )
} )

export async function requireAuthenticatedServerOnlySession() {
  return requireAuthContextSession()
}
