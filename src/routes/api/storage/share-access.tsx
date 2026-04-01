import { createFileRoute } from "@tanstack/react-router"
import {
    getShareByToken,
    getSharedFilePresignedUrl,
    getSharedFolderTreeByToken,
} from "@/lib/share-queries"

export const Route = createFileRoute( "/api/storage/share-access" )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const url = new URL( request.url )
                    const token = url.searchParams.get( "token" )

                    if ( !token ) {
                        return Response.json( { error: "Missing token" }, { status: 400 } )
                    }

                    const includeTree = url.searchParams.get( "includeTree" ) === "1"
                    const result = await getShareByToken( token )
                    if ( !result ) {
                        return Response.json( { error: "Share link not found or expired" }, { status: 404 } )
                    }

                    if ( result.type === "file" ) {
                        const fileItem = result.item as {
                            id: string
                            name: string
                            mimeType: string | null
                            sizeInBytes: number
                            objectKey: string
                            providerId: string | null
                        }
                        const presignedUrl = await getSharedFilePresignedUrl(
                            fileItem.objectKey,
                            fileItem.name,
                            fileItem.providerId
                        )
                        return Response.json( {
                            type: "file",
                            name: fileItem.name,
                            mimeType: fileItem.mimeType,
                            sizeInBytes: fileItem.sizeInBytes,
                            presignedUrl,
                        } )
                    }

                    const folderItem = result.item as { id: string; name: string }
                    const tree = includeTree ? await getSharedFolderTreeByToken( token ) : null
                    return Response.json( {
                        type: "folder",
                        name: folderItem.name,
                        folderId: folderItem.id,
                        tree,
                    } )
                } catch ( error ) {
                    console.error( "[Server] Share access error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: 500 } )
                }
            },
        },
    },
} )
