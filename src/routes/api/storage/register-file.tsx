import { createFileRoute } from "@tanstack/react-router"
import { getAuthenticatedUser } from "@/lib/server-auth"
import { resolveProviderId } from "@/lib/s3-provider-client"
import { DEFAULT_FILE_SIZE_LIMIT_BYTES } from "@/lib/storage-quota-constants"

export const Route = createFileRoute( "/api/storage/register-file" )( {
    component: () => null,
    server: {
        handlers: {
            POST: async ( { request } ) => {
                try {
                    const authUser = await getAuthenticatedUser()
                    const body = ( await request.json() ) as {
                        fileName?: string
                        objectKey?: string
                        mimeType?: string
                        fileSize?: number
                        parentFolderId?: string | null
                        providerId?: string | null
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

                    const [{ db }, { file: storageFile, folder, userStorage }] = await Promise.all( [
                        import( "@/db" ),
                        import( "@/db/schema/storage" ),
                    ] )

                    const { eq, sql } = await import( "drizzle-orm" )

                    const storageRows = await db
                        .select( { fileSizeLimit: userStorage.fileSizeLimit } )
                        .from( userStorage )
                        .where( eq( userStorage.userId, authUser.id ) )
                        .limit( 1 )
                    const fileSizeLimit = storageRows[0]?.fileSizeLimit ?? DEFAULT_FILE_SIZE_LIMIT_BYTES

                    if ( body.fileSize > fileSizeLimit ) {
                        return Response.json( {
                            error: `File exceeds your maximum allowed size (${fileSizeLimit} bytes)`,
                            code: "FILE_SIZE_LIMIT_EXCEEDED",
                            fileSizeLimit,
                        }, { status: 403 } )
                    }

                    let isPrivatelyLocked = false
                    if ( body.parentFolderId ) {
                        const { and, eq: eqForFolder } = await import( "drizzle-orm" )
                        const parentRows = await db.select( { isPrivatelyLocked: folder.isPrivatelyLocked } )
                            .from( folder )
                            .where( and( eqForFolder( folder.id, body.parentFolderId ), eqForFolder( folder.userId, authUser.id ) ) )
                            .limit( 1 )
                        if ( parentRows.length > 0 ) {
                            isPrivatelyLocked = parentRows[0].isPrivatelyLocked
                        }
                    }

                    const resolvedProviderId = await resolveProviderId( body.providerId )

                    const [insertedFile] = await db
                        .insert( storageFile )
                        .values( {
                            name: body.fileName,
                            objectKey: body.objectKey,
                            mimeType: body.mimeType || null,
                            sizeInBytes: body.fileSize,
                            userId: authUser.id,
                            folderId: body.parentFolderId || null,
                            providerId: resolvedProviderId,
                            isPrivatelyLocked,
                        } )
                        .returning( {
                            id: storageFile.id,
                            name: storageFile.name,
                            mimeType: storageFile.mimeType,
                            sizeInBytes: storageFile.sizeInBytes,
                            objectKey: storageFile.objectKey,
                            createdAt: storageFile.createdAt,
                        } )

                    // Upsert userStorage and increment usedStorage atomically
                    // Best-effort: if this fails the quota will self-correct on next reconciliation
                    try {
                        await db
                            .insert( userStorage )
                            .values( {
                                userId: authUser.id,
                                usedStorage: body.fileSize,
                            } )
                            .onConflictDoUpdate( {
                                target: userStorage.userId,
                                set: {
                                    usedStorage: sql`${userStorage.usedStorage} + ${body.fileSize}`,
                                },
                            } )
                    } catch ( storageErr ) {
                        console.error( "[Server] Failed to update usedStorage:", storageErr )
                    }

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
