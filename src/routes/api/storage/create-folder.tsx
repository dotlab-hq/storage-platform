import { createFileRoute } from "@tanstack/react-router"

import { createNewFolder } from "@/lib/storage-server"

export const Route = createFileRoute( "/api/storage/create-folder" )( {
    component: () => null,
    server: {
        handlers: {
            POST: async ( { request } ) => {
                try {
                    const body = ( await request.json() ) as {
                        userId?: string
                        name?: string
                        parentFolderId?: string | null
                    }

                    if ( !body.userId || typeof body.userId !== "string" ) {
                        return Response.json( { error: "Missing userId" }, { status: 400 } )
                    }

                    if ( !body.name || typeof body.name !== "string" || body.name.trim().length === 0 ) {
                        return Response.json( { error: "Missing folder name" }, { status: 400 } )
                    }

                    const folder = await createNewFolder( {
                        userId: body.userId,
                        name: body.name.trim(),
                        parentFolderId: body.parentFolderId ?? null,
                    } )

                    return Response.json( { folder } )
                } catch ( error ) {
                    console.error( "[Server] Create folder API error:", error )
                    const errorMessage = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: errorMessage }, { status: 500 } )
                }
            },
        },
    },
} )
