import { createFileRoute } from "@tanstack/react-router"
import { searchItems } from "@/lib/storage-queries"

export const Route = createFileRoute( "/api/storage/search" )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const url = new URL( request.url )
                    const userId = url.searchParams.get( "userId" )
                    const query = url.searchParams.get( "q" )

                    if ( !userId ) {
                        return Response.json( { error: "Missing userId" }, { status: 400 } )
                    }
                    if ( !query || query.trim().length === 0 ) {
                        return Response.json( { folders: [], files: [] } )
                    }

                    const results = await searchItems( userId, query.trim() )
                    return Response.json( results )
                } catch ( error ) {
                    console.error( "[Server] Search error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: 500 } )
                }
            },
        },
    },
} )
