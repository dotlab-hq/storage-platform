import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, and, sql } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { db } from '@/db'
import { folder, file as storageFile } from '@/db/schema/storage'
import { isDescendantFolder } from '@/lib/folder-paths'

const MoveItemsSchema = z.object( {
    itemIds: z.array( z.string().min( 1 ) ),
    itemTypes: z.array( z.enum( ['file', 'folder'] ) ),
    targetFolderId: z.string().nullable(),
} )

export const moveItemsFn = createServerFn( { method: 'POST' } )
    .inputValidator( MoveItemsSchema )
    .handler( async ( { data } ) => {
        const user = await getAuthenticatedUser()
        const userId = user.id
        const { itemIds, itemTypes, targetFolderId } = data

        if ( itemIds.length !== itemTypes.length ) {
            throw new Error( 'Mismatched item ids and types array lengths' )
        }

        const movingFolderIds = itemIds.filter(
            ( _, index ) => itemTypes[index] === 'folder',
        )
        let targetIsPrivatelyLocked = false
        let allUserFolders: { id: string; parentFolderId: string | null }[] = []

        if ( targetFolderId ) {
            const targetFolderRows = await db
                .select( {
                    id: folder.id,
                    isPrivatelyLocked: folder.isPrivatelyLocked,
                } )
                .from( folder )
                .where( and( eq( folder.id, targetFolderId ), eq( folder.userId, userId ) ) )
                .limit( 1 )

            if ( targetFolderRows.length === 0 ) {
                throw new Error( 'Target folder not found' )
            }

            targetIsPrivatelyLocked = targetFolderRows[0].isPrivatelyLocked

            if ( movingFolderIds.length > 0 ) {
                allUserFolders = await db
                    .select( {
                        id: folder.id,
                        parentFolderId: folder.parentFolderId,
                    } )
                    .from( folder )
                    .where( eq( folder.userId, userId ) )

                for ( const movingFolderId of movingFolderIds ) {
                    if (
                        isDescendantFolder( movingFolderId, targetFolderId, allUserFolders )
                    ) {
                        throw new Error( 'Cannot move a folder into itself or its descendant' )
                    }
                }
            }
        }

        for ( let i = 0; i < itemIds.length; i++ ) {
            const id = itemIds[i]
            const type = itemTypes[i]
            if ( type === 'folder' ) {
                await db
                    .update( folder )
                    .set( { parentFolderId: targetFolderId } )
                    .where( and( eq( folder.id, id ), eq( folder.userId, userId ) ) )
            } else {
                await db
                    .update( storageFile )
                    .set( {
                        folderId: targetFolderId,
                        isPrivatelyLocked: targetFolderId
                            ? targetIsPrivatelyLocked
                            : sql`is_privately_locked`,
                    } )
                    .where( and( eq( storageFile.id, id ), eq( storageFile.userId, userId ) ) )
            }
        }

        return { moved: itemIds.length }
    } )
