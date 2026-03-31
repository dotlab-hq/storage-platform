import { createFileRoute } from "@tanstack/react-router"
import { getAllFolders } from "@/lib/storage-queries"
import { getAuthAwareStatus, requireSessionUser } from "@/lib/auth-guard"

export const Route = createFileRoute( "/api/storage/all-folders" )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const user = await requireSessionUser( request )
                    const userId = user.id
                    const folders = await getAllFolders( userId )
                    return Response.json( { folders } )
                } catch ( error ) {
                    console.error( "[Server] All folders error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: getAuthAwareStatus( error ) } )
                }
            },
        },
    },
} )
