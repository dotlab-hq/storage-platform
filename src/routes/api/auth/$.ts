import { createFileRoute } from '@tanstack/react-router'
import { loadAuth } from '@/lib/auth-loader'

const AUTH_HANDLER_TIMEOUT_MS = Number( process.env.AUTH_HANDLER_TIMEOUT_MS ?? 10000 )

function createServiceUnavailableResponse( message: string ) {
  return Response.json(
    {
      error: message,
      code: 'AUTH_DB_UNAVAILABLE',
    },
    { status: 503 },
  )
}

async function handleAuthRequest( request: Request ) {
  try {
    const auth = await loadAuth()
    const response = await Promise.race( [
      auth.handler( request ),
      new Promise<Response>( ( resolve ) => {
        const timeoutMessage = 'Authentication is temporarily unavailable. Please retry in a moment.'
        setTimeout( () => resolve( createServiceUnavailableResponse( timeoutMessage ) ), AUTH_HANDLER_TIMEOUT_MS )
      } ),
    ] )

    return response
  } catch ( error ) {
    console.error( '[Auth Route] Better Auth handler failed:', error )
    const fallbackMessage = 'Authentication request failed due to database connectivity. Please retry shortly.'
    return createServiceUnavailableResponse( fallbackMessage )
  }
}

export const Route = createFileRoute( '/api/auth/$' )( {
  server: {
    handlers: {
      GET: ( { request } ) => handleAuthRequest( request ),
      POST: ( { request } ) => handleAuthRequest( request ),
    },
  },
} )
