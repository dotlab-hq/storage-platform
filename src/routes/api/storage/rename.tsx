import { createFileRoute } from "@tanstack/react-router"
import { renameItemFn } from "@/lib/storage/mutations/rename"

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

                    const result = await renameItemFn( { data: { itemId: body.itemId, newName: body.newName.trim(), itemType: body.itemType } } )
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
