import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { userStorage } from "@/db/schema/storage"
import { getAuthenticatedUser } from "@/lib/server-auth"
import { DEFAULT_ALLOCATED_STORAGE_BYTES, DEFAULT_FILE_SIZE_LIMIT_BYTES } from "@/lib/storage-quota-constants"

function toNonNegativeBytes( value: number | null | undefined, fallback: number ): number {
    if ( typeof value !== "number" || !Number.isFinite( value ) ) {
        return fallback
    }
    return Math.max( 0, value )
}

export const getUserQuotaSnapshotFn = createServerFn( { method: "GET" } )
    .handler( async () => {
        const currentUser = await getAuthenticatedUser()

        let [row] = await db
            .select( {
                usedStorage: userStorage.usedStorage,
                allocatedStorage: userStorage.allocatedStorage,
                fileSizeLimit: userStorage.fileSizeLimit,
            } )
            .from( userStorage )
            .where( eq( userStorage.userId, currentUser.id ) )
            .limit( 1 )

        if ( !row ) {
            const [inserted] = await db
                .insert( userStorage )
                .values( {
                    userId: currentUser.id,
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

        return {
            usedStorage: toNonNegativeBytes( row.usedStorage, 0 ),
            allocatedStorage: toNonNegativeBytes( row.allocatedStorage, DEFAULT_ALLOCATED_STORAGE_BYTES ),
            fileSizeLimit: toNonNegativeBytes( row.fileSizeLimit, DEFAULT_FILE_SIZE_LIMIT_BYTES ),
        }
    } )
