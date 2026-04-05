import { createFileRoute } from '@tanstack/react-router'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { saveTextFileFn } from '@/lib/storage/mutations/content'

export const Route = createFileRoute( '/api/storage/save-text-file' )( {
  component: () => null,
  server: {
    handlers: {
      POST: async ( { request } ) => {
        try {
          await getAuthenticatedUser()
          const body = ( await request.json() ) as {
            fileId?: string
            fileName?: string
            content?: string
            parentFolderId?: string | null
          }

          if ( !body.fileName || typeof body.fileName !== 'string' ) {
            return Response.json( { error: 'Missing fileName' }, { status: 400 } )
          }

          if ( typeof body.content !== 'string' ) {
            return Response.json( { error: 'Missing content' }, { status: 400 } )
          }

          const file = await saveTextFileFn( {
            data: {
              fileId: body.fileId ?? '',
              name: body.fileName,
              content: body.content,
                          }
          } )

          return Response.json( { file } )
        } catch ( error ) {
          console.error( '[Server] Text file save error:', error )
          const message = error instanceof Error ? error.message : String( error )
          return Response.json( { error: message }, { status: 500 } )
        }
      },
    },
  },
} )
