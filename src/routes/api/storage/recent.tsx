import { createFileRoute } from "@tanstack/react-router"
import { getRecentItems } from "@/lib/storage-queries"
import { getAuthAwareStatus, requireSessionUser } from "@/lib/auth-guard"

export const Route = createFileRoute( "/api/storage/recent" )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const user = await requireSessionUser( request )
                    const userId = user.id
                    const items = await getRecentItems( userId )
                    return Response.json( items )
                } catch ( error ) {
                    console.error( "[Server] Recent items error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: getAuthAwareStatus( error ) } )
                }
            },
        },
    },
} )
