import { createFileRoute } from "@tanstack/react-router"
import { getFilePresignedUrl } from "@/lib/storage-mutations"

export const Route = createFileRoute( "/api/storage/presign" )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const url = new URL( request.url )
                    const userId = url.searchParams.get( "userId" )
                    const fileId = url.searchParams.get( "fileId" )

                    if ( !userId || !fileId ) {
                        return Response.json( { error: "Missing userId or fileId" }, { status: 400 } )
                    }

                    const result = await getFilePresignedUrl( userId, fileId )
                    return Response.json( result )
                } catch ( error ) {
                    console.error( "[Server] Presign error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: 500 } )
                }
            },
        },
    },
} )
