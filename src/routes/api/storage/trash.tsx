import { createFileRoute } from "@tanstack/react-router"
import { listTrashItems } from "@/lib/trash-queries"
import { getAuthAwareStatus, requireSessionUser } from "@/lib/auth-guard"

export const Route = createFileRoute( "/api/storage/trash" )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const user = await requireSessionUser( request )
                    const userId = user.id
                    const items = await listTrashItems( userId )
                    return Response.json( { items } )
                } catch ( error ) {
                    console.error( "[Server] Trash list error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: getAuthAwareStatus( error ) } )
                }
            },
        },
    },
} )
