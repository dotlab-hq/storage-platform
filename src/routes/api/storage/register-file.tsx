import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute( "/api/storage/register-file" )( {
    component: () => null,
    server: {
        handlers: {
            POST: async ( { request } ) => {
                try {
                    const body = ( await request.json() ) as {
                        userId?: string
                        fileName?: string
                        objectKey?: string
                        mimeType?: string
                        fileSize?: number
                        parentFolderId?: string | null
                    }

                    if ( !body.userId || typeof body.userId !== "string" ) {
                        return Response.json( { error: "Missing userId" }, { status: 400 } )
                    }
                    if ( !body.fileName || typeof body.fileName !== "string" ) {
                        return Response.json( { error: "Missing fileName" }, { status: 400 } )
                    }
                    if ( !body.objectKey || typeof body.objectKey !== "string" ) {
                        return Response.json( { error: "Missing objectKey" }, { status: 400 } )
                    }
                    if ( typeof body.fileSize !== "number" || body.fileSize < 0 ) {
                        return Response.json( { error: "Invalid fileSize" }, { status: 400 } )
                    }

                    const [{ db }, { file: storageFile }] = await Promise.all( [
                        import( "@/db" ),
                        import( "@/db/schema/storage" ),
                    ] )

                    const [insertedFile] = await db
                        .insert( storageFile )
                        .values( {
                            name: body.fileName,
                            objectKey: body.objectKey,
                            mimeType: body.mimeType || null,
                            sizeInBytes: body.fileSize,
                            userId: body.userId,
                            folderId: body.parentFolderId || null,
                        } )
                        .returning( {
                            id: storageFile.id,
                            name: storageFile.name,
                            createdAt: storageFile.createdAt,
                        } )

                    return Response.json( { file: insertedFile } )
                } catch ( error ) {
                    console.error( "[Server] Register file error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: 500 } )
                }
            },
        },
    },
} )
