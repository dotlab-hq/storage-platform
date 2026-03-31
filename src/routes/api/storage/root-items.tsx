import { createFileRoute } from "@tanstack/react-router"

import { listRootItems } from "@/lib/storage-server"
import { getAuthAwareStatus, requireSessionUser } from "@/lib/auth-guard"

export const Route = createFileRoute( "/api/storage/root-items" )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const user = await requireSessionUser( request )
                    const userId = user.id
                    const items = await listRootItems( userId )
                    return Response.json( items )
                } catch ( error ) {
                    console.error( "[Server] Root items API error:", error )
                    const errorMessage = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: errorMessage }, { status: getAuthAwareStatus( error ) } )
                }
            },
        },
    },
} )
