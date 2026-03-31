import { createFileRoute } from "@tanstack/react-router"
import { eq } from "drizzle-orm"
import { getAuthAwareStatus, requireSessionUser } from "@/lib/auth-guard"

export const Route = createFileRoute( "/api/storage/quota" )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const user = await requireSessionUser( request )
                    const userId = user.id

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
                            .values( { userId } )
                            .onConflictDoNothing()
                            .returning( {
                                usedStorage: userStorage.usedStorage,
                                allocatedStorage: userStorage.allocatedStorage,
                                fileSizeLimit: userStorage.fileSizeLimit,
                            } )
                        row = inserted ?? {
                            usedStorage: 0,
                            allocatedStorage: 250 * 1024 * 1024,
                            fileSizeLimit: 10 * 1024 * 1024,
                        }
                    }

                    return Response.json( {
                        usedStorage: row.usedStorage,
                        allocatedStorage: row.allocatedStorage,
                        fileSizeLimit: row.fileSizeLimit,
                    } )
                } catch ( error ) {
                    console.error( "[Server] Quota error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: getAuthAwareStatus( error ) } )
                }
            },
        },
    },
} )
