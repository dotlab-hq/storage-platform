import { createFileRoute } from "@tanstack/react-router"
import { moveItems } from "@/lib/storage-mutations"
import { getAuthAwareStatus, requireSessionUser } from "@/lib/auth-guard"

export const Route = createFileRoute( "/api/storage/move" )( {
    component: () => null,
    server: {
        handlers: {
            POST: async ( { request } ) => {
                try {
                    const body = ( await request.json() ) as {
                        itemIds?: string[]
                        itemTypes?: ( "file" | "folder" )[]
                        targetFolderId?: string | null
                    }
                    const user = await requireSessionUser( request )

                    if ( !body.itemIds?.length || !body.itemTypes?.length ) {
                        return Response.json( { error: "Missing required fields" }, { status: 400 } )
                    }

                    const result = await moveItems(
                        user.id,
                        body.itemIds,
                        body.itemTypes,
                        body.targetFolderId ?? null
                    )
                    return Response.json( result )
                } catch ( error ) {
                    console.error( "[Server] Move error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: getAuthAwareStatus( error ) } )
                }
            },
        },
    },
} )
