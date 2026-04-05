import { createFileRoute } from '@tanstack/react-router'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { decodeNavToken } from '@/lib/nav-token'
import { getOwnedFileRedirectUrlFn } from '@/lib/storage/mutations/urls'

export const Route = createFileRoute( '/api/storage/file-link' )( {
  component: () => null,
  server: {
    handlers: {
      GET: async ( { request } ) => {
        try {
          const requestUrl = new URL( request.url )
          const nav = requestUrl.searchParams.get( 'nav' )

          if ( !nav ) {
            return Response.json(
              { error: 'Missing nav token' },
              { status: 400 },
            )
          }

          const payload = decodeNavToken( nav )
          if ( !payload?.fileId ) {
            return Response.json(
              { error: 'Invalid nav token' },
              { status: 400 },
            )
          }

          const currentUser = await getAuthenticatedUser().catch( () => null )
          if ( !currentUser ) {
            return Response.redirect( new URL( '/auth', request.url ), 302 )
          }

          const redirectUrl = await getOwnedFileRedirectUrlFn( { data: { fileId: payload.fileId } } )

          return Response.redirect( redirectUrl.url, 302 )
        } catch ( error ) {
          console.error( '[Server] File link redirect error:', error )
          const message = error instanceof Error ? error.message : String( error )
          return Response.json( { error: message }, { status: 403 } )
        }
      },
    },
  },
} )
