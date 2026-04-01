import { createFileRoute } from "@tanstack/react-router"
import { eq } from "drizzle-orm"
import { DEFAULT_ALLOCATED_STORAGE_BYTES, DEFAULT_FILE_SIZE_LIMIT_BYTES } from "@/lib/storage-quota-constants"

function toNonNegativeBytes( value: number | null | undefined, fallback: number ): number {
    if ( typeof value !== "number" || !Number.isFinite( value ) ) {
        return fallback
    }
    return Math.max( 0, value )
}

export const Route = createFileRoute( "/api/storage/quota" )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const url = new URL( request.url )
                    const userId = url.searchParams.get( "userId" )

                    if ( !userId ) {
                        return Response.json( { error: "Missing userId" }, { status: 400 } )
                    }

                    const [{ db }, { userStorage }] = await Promise.all( [
                        import( "@/db" ),
                        import( "@/db/schema/storage" ),
                    ] )

                    let [row] = await db
                        .select( {
                            usedStorage: userStorage.usedStorage,
                            allocatedStorage: userStorage.allocatedStorage,
                            fileSizeLimit: userStorage.fileSizeLimit,
                        } )
                        .from( userStorage )
                        .where( eq( userStorage.userId, userId ) )
                        .limit( 1 )

                    // Initialize userStorage row if it doesn't exist yet
                    if ( !row ) {
                        const [inserted] = await db
                            .insert( userStorage )
                            .values( {
                                userId,
                                allocatedStorage: DEFAULT_ALLOCATED_STORAGE_BYTES,
                                fileSizeLimit: DEFAULT_FILE_SIZE_LIMIT_BYTES,
                                usedStorage: 0,
                            } )
                            .onConflictDoNothing()
                            .returning( {
                                usedStorage: userStorage.usedStorage,
                                allocatedStorage: userStorage.allocatedStorage,
                                fileSizeLimit: userStorage.fileSizeLimit,
                            } )
                        row = inserted ?? {
                            usedStorage: 0,
                            allocatedStorage: DEFAULT_ALLOCATED_STORAGE_BYTES,
                            fileSizeLimit: DEFAULT_FILE_SIZE_LIMIT_BYTES,
                        }
                    }

                    return Response.json( {
                        usedStorage: toNonNegativeBytes( row.usedStorage, 0 ),
                        allocatedStorage: toNonNegativeBytes( row.allocatedStorage, DEFAULT_ALLOCATED_STORAGE_BYTES ),
                        fileSizeLimit: toNonNegativeBytes( row.fileSizeLimit, DEFAULT_FILE_SIZE_LIMIT_BYTES ),
                    } )
                } catch ( error ) {
                    console.error( "[Server] Quota error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: 500 } )
                }
            },
        },
    },
} )
