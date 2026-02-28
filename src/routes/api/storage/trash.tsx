import { createFileRoute } from "@tanstack/react-router"
import { listTrashItems } from "@/lib/trash-queries"

export const Route = createFileRoute( "/api/storage/trash" )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const url = new URL( request.url )
                    const userId = url.searchParams.get( "userId" )

                    if ( !userId ) {
                        return Response.json( { error: "Missing userId" }, { status: 400 } )
                    }

                    const items = await listTrashItems( userId )
                    return Response.json( { items } )
                } catch ( error ) {
                    console.error( "[Server] Trash list error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: 500 } )
                }
            },
        },
    },
} )
