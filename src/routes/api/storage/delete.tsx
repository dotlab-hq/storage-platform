import { createFileRoute } from "@tanstack/react-router"
import { deleteItems } from "@/lib/storage-mutations"

export const Route = createFileRoute( "/api/storage/delete" )( {
    component: () => null,
    server: {
        handlers: {
            POST: async ( { request } ) => {
                try {
                    const body = ( await request.json() ) as {
                        userId?: string
                        itemIds?: string[]
                        itemTypes?: ( "file" | "folder" )[]
                    }

                    if ( !body.userId || !body.itemIds?.length || !body.itemTypes?.length ) {
                        return Response.json( { error: "Missing required fields" }, { status: 400 } )
                    }

                    if ( body.itemIds.length !== body.itemTypes.length ) {
                        return Response.json( { error: "Mismatched ids/types arrays" }, { status: 400 } )
                    }

                    const result = await deleteItems( body.userId, body.itemIds, body.itemTypes )
                    return Response.json( result )
                } catch ( error ) {
                    console.error( "[Server] Delete error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: 500 } )
                }
            },
        },
    },
} )
