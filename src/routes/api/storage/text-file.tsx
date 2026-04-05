import { createFileRoute } from '@tanstack/react-router'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { getTextFileContentFn } from '@/lib/storage/mutations/content'

export const Route = createFileRoute( '/api/storage/text-file' )( {
  component: () => null,
  server: {
    handlers: {
      GET: async ( { request } ) => {
        try {
          await getAuthenticatedUser()
          const url = new URL( request.url )
          const fileId = url.searchParams.get( 'fileId' )

          if ( !fileId ) {
            return Response.json( { error: 'Missing fileId' }, { status: 400 } )
          }

          const file = await getTextFileContentFn( { data: { fileId } } )
          return Response.json( file )
        } catch ( error ) {
          console.error( '[Server] Text file read error:', error )
          const message = error instanceof Error ? error.message : String( error )
          return Response.json( { error: message }, { status: 500 } )
        }
      },
    },
  },
} )
