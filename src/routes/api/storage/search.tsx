import { createFileRoute } from "@tanstack/react-router"
import { searchItems } from "@/lib/storage-queries"
import { getAuthAwareStatus, requireSessionUser } from "@/lib/auth-guard"

export const Route = createFileRoute( "/api/storage/search" )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const url = new URL( request.url )
                    const user = await requireSessionUser( request )
                    const userId = user.id
                    const query = url.searchParams.get( "q" )
                    if ( !query || query.trim().length === 0 ) {
                        return Response.json( { folders: [], files: [] } )
                    }

                    const results = await searchItems( userId, query.trim() )
                    return Response.json( results )
                } catch ( error ) {
                    console.error( "[Server] Search error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: getAuthAwareStatus( error ) } )
                }
            },
        },
    },
} )
