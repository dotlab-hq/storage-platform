import { createFileRoute } from "@tanstack/react-router"
import { listFolderItems, getFolderBreadcrumbs } from "@/lib/storage-queries"
import { touchFolderOpened } from "@/lib/storage-mutations"
import { getAuthAwareStatus, requireSessionUser } from "@/lib/auth-guard"

export const Route = createFileRoute( "/api/storage/folder-items" )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const url = new URL( request.url )
                    const user = await requireSessionUser( request )
                    const userId = user.id
                    const folderId = url.searchParams.get( "folderId" )

                    const items = await listFolderItems( userId, folderId || null )

                    let breadcrumbs: { id: string; name: string }[] = []
                    if ( folderId ) {
                        breadcrumbs = await getFolderBreadcrumbs( userId, folderId )
                        void touchFolderOpened( userId, folderId )
                    }

                    return Response.json( { ...items, breadcrumbs } )
                } catch ( error ) {
                    console.error( "[Server] Folder items error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: getAuthAwareStatus( error ) } )
                }
            },
        },
    },
} )
