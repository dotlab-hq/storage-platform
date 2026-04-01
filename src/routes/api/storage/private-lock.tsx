import { createFileRoute } from "@tanstack/react-router"
import { setFolderPrivateLock } from "@/lib/private-lock-mutations"

export const Route = createFileRoute( "/api/storage/private-lock" )( {
    component: () => null,
    server: {
        handlers: {
            POST: async ( { request } ) => {
                try {
                    const body = ( await request.json() ) as {
                        userId?: string
                        folderId?: string
                        isPrivatelyLocked?: boolean
                    }

                    if ( !body.userId || !body.folderId || typeof body.isPrivatelyLocked !== "boolean" ) {
                        return Response.json( { error: "Missing params" }, { status: 400 } )
                    }

                    const folder = await setFolderPrivateLock( body.userId, body.folderId, body.isPrivatelyLocked )
                    return Response.json( { folder } )
                } catch ( error ) {
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: 500 } )
                }
            },
        },
    },
} )
