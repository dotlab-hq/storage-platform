import { createFileRoute } from "@tanstack/react-router"

import { uploadSingleFile } from "@/lib/storage-server"

export const Route = createFileRoute( "/api/upload" )( {
    component: () => null,
    server: {
        handlers: {
            POST: async ( { request } ) => {
                try {
                    const formData = await request.formData()
                    const userIdValue = formData.get( "userId" )
                    const fileValue = formData.get( "file" )
                    const parentFolderIdValue = formData.get( "parentFolderId" )

                    if ( typeof userIdValue !== "string" || userIdValue.trim().length === 0 ) {
                        return Response.json( { error: "Missing userId" }, { status: 400 } )
                    }

                    if ( !( fileValue instanceof File ) ) {
                        return Response.json( { error: "Missing file" }, { status: 400 } )
                    }


                    console.log( `[Server] Received upload request for file: ${fileValue.name}, userId: ${userIdValue}, parentFolderId: ${parentFolderIdValue}` )

                    const insertedFile = await uploadSingleFile( {
                        userId: userIdValue,
                        file: fileValue,
                        parentFolderId:
                            typeof parentFolderIdValue === "string" && parentFolderIdValue.length > 0
                                ? parentFolderIdValue
                                : null,
                    } )

                    return Response.json( { file: insertedFile } )
                } catch ( error ) {
                    console.error( "[Server] Upload API error:", error )
                    const errorMessage = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: errorMessage }, { status: 500 } )
                }
            },
        },
    },
} )
