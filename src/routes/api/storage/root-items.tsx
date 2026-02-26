import { createFileRoute } from "@tanstack/react-router"

import { listRootItems } from "@/lib/storage-server"

export const Route = createFileRoute( "/api/storage/root-items" )( {
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

                    const items = await listRootItems( userId )
                    return Response.json( items )
                } catch ( error ) {
                    console.error( "[Server] Root items API error:", error )
                    const errorMessage = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: errorMessage }, { status: 500 } )
                }
            },
        },
    },
} )
