import { createFileRoute } from "@tanstack/react-router"
import { renameItem } from "@/lib/storage-mutations"

export const Route = createFileRoute( "/api/storage/rename" )( {
    component: () => null,
    server: {
        handlers: {
            POST: async ( { request } ) => {
                try {
                    const body = ( await request.json() ) as {
                        userId?: string
                        itemId?: string
                        newName?: string
                        itemType?: "file" | "folder"
                    }

                    if ( !body.userId || !body.itemId || !body.newName || !body.itemType ) {
                        return Response.json( { error: "Missing required fields" }, { status: 400 } )
                    }

                    const result = await renameItem( body.userId, body.itemId, body.newName.trim(), body.itemType )
                    if ( !result ) {
                        return Response.json( { error: "Item not found" }, { status: 404 } )
                    }

                    return Response.json( { item: result } )
                } catch ( error ) {
                    console.error( "[Server] Rename error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: 500 } )
                }
            },
        },
    },
} )
