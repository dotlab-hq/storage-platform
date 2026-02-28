import { createFileRoute } from "@tanstack/react-router"
import { listFolderItems, getFolderBreadcrumbs } from "@/lib/storage-queries"
import { touchFolderOpened } from "@/lib/storage-mutations"

export const Route = createFileRoute( "/api/storage/folder-items" )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const url = new URL( request.url )
                    const userId = url.searchParams.get( "userId" )
                    const folderId = url.searchParams.get( "folderId" )

                    if ( !userId ) {
                        return Response.json( { error: "Missing userId" }, { status: 400 } )
                    }

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
                    return Response.json( { error: msg }, { status: 500 } )
                }
            },
        },
    },
} )
