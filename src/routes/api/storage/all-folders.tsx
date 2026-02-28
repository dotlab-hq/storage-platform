import { createFileRoute } from "@tanstack/react-router"
import { getAllFolders } from "@/lib/storage-queries"

export const Route = createFileRoute( "/api/storage/all-folders" )( {
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

                    const folders = await getAllFolders( userId )
                    return Response.json( { folders } )
                } catch ( error ) {
                    console.error( "[Server] All folders error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: 500 } )
                }
            },
        },
    },
} )
