import { createFileRoute } from "@tanstack/react-router"
import { moveItemsFn } from "@/lib/storage/mutations/move"

export const Route = createFileRoute( "/api/storage/move" )( {
    component: () => null,
    server: {
        handlers: {
            POST: async ( { request } ) => {
                try {
                    const body = ( await request.json() ) as {
                        userId?: string
                        itemIds?: string[]
                        itemTypes?: ( "file" | "folder" )[]
                        targetFolderId?: string | null
                    }

                    if ( !body.userId || !body.itemIds?.length || !body.itemTypes?.length ) {
                        return Response.json( { error: "Missing required fields" }, { status: 400 } )
                    }

                    const result = await moveItemsFn( {
                        data: {
                            itemIds: body.itemIds,
                            itemTypes: body.itemTypes,
                            targetFolderId: body.targetFolderId ?? null
                        }
                    } )
                    return Response.json( result )
                } catch ( error ) {
                    console.error( "[Server] Move error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: 500 } )
                }
            },
        },
    },
} )
