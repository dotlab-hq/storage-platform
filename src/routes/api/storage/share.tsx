import { createFileRoute } from "@tanstack/react-router"
import { createShareLink, getShareLink, toggleShareLink } from "@/lib/share-mutations"
import { getAuthAwareStatus, requireSessionUser } from "@/lib/auth-guard"

export const Route = createFileRoute( "/api/storage/share" )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const url = new URL( request.url )
                    const user = await requireSessionUser( request )
                    const itemId = url.searchParams.get( "itemId" )
                    const itemType = url.searchParams.get( "itemType" ) as "file" | "folder" | null

                    if ( !itemId || !itemType ) {
                        return Response.json( { error: "Missing params" }, { status: 400 } )
                    }

                    const link = await getShareLink( user.id, itemId, itemType )
                    return Response.json( { link } )
                } catch ( error ) {
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: getAuthAwareStatus( error ) } )
                }
            },
            POST: async ( { request } ) => {
                try {
                    const user = await requireSessionUser( request )
                    const body = await request.json() as {
                        action: "create" | "toggle"
                        itemId?: string
                        itemType?: "file" | "folder"
                        linkId?: string
                        isActive?: boolean
                    }

                    if ( body.action === "create" ) {
                        if ( !body.itemId || !body.itemType ) {
                            return Response.json( { error: "Missing params" }, { status: 400 } )
                        }
                        const link = await createShareLink( user.id, body.itemId, body.itemType, false )
                        return Response.json( { link } )
                    }

                    if ( body.action === "toggle" ) {
                        if ( !body.linkId || body.isActive === undefined ) {
                            return Response.json( { error: "Missing params" }, { status: 400 } )
                        }
                        const link = await toggleShareLink( user.id, body.linkId, body.isActive )
                        return Response.json( { link } )
                    }

                    return Response.json( { error: "Invalid action" }, { status: 400 } )
                } catch ( error ) {
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: getAuthAwareStatus( error ) } )
                }
            },
        },
    },
} )
