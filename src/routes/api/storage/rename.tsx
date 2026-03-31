import { createFileRoute } from "@tanstack/react-router"
import { renameItem } from "@/lib/storage-mutations"
import { getAuthAwareStatus, requireSessionUser } from "@/lib/auth-guard"

export const Route = createFileRoute( "/api/storage/rename" )( {
    component: () => null,
    server: {
        handlers: {
            POST: async ( { request } ) => {
                try {
                    const body = ( await request.json() ) as {
                        itemId?: string
                        newName?: string
                        itemType?: "file" | "folder"
                    }
                    const user = await requireSessionUser( request )

                    if ( !body.itemId || !body.newName || !body.itemType ) {
                        return Response.json( { error: "Missing required fields" }, { status: 400 } )
                    }

                    const result = await renameItem( user.id, body.itemId, body.newName.trim(), body.itemType )
                    if ( !result ) {
                        return Response.json( { error: "Item not found" }, { status: 404 } )
                    }

                    return Response.json( { item: result } )
                } catch ( error ) {
                    console.error( "[Server] Rename error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: getAuthAwareStatus( error ) } )
                }
            },
        },
    },
} )
