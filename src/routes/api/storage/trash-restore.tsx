import { createFileRoute } from "@tanstack/react-router"
import { restoreItems } from "@/lib/trash-mutations"
import { getAuthAwareStatus, requireSessionUser } from "@/lib/auth-guard"

export const Route = createFileRoute( "/api/storage/trash-restore" )( {
    component: () => null,
    server: {
        handlers: {
            POST: async ( { request } ) => {
                try {
                    const body = ( await request.json() ) as {
                        itemIds?: string[]
                        itemTypes?: ( "file" | "folder" )[]
                    }
                    const user = await requireSessionUser( request )

                    if ( !body.itemIds?.length || !body.itemTypes?.length ) {
                        return Response.json( { error: "Missing required fields" }, { status: 400 } )
                    }

                    if ( body.itemIds.length !== body.itemTypes.length ) {
                        return Response.json( { error: "Mismatched ids/types arrays" }, { status: 400 } )
                    }

                    const result = await restoreItems( user.id, body.itemIds, body.itemTypes )
                    return Response.json( result )
                } catch ( error ) {
                    console.error( "[Server] Restore error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: getAuthAwareStatus( error ) } )
                }
            },
        },
    },
} )
