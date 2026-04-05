import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, and, inArray } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { db } from '@/db'
import { folder, file as storageFile } from '@/db/schema/storage'

const DeleteItemsSchema = z.object( {
    itemIds: z.array( z.string().min( 1 ) ),
    itemTypes: z.array( z.enum( ['file', 'folder'] ) ),
} )

export const deleteItemsFn = createServerFn( { method: 'POST' } )
    .inputValidator( DeleteItemsSchema )
    .handler( async ( { data } ) => {
        const user = await getAuthenticatedUser()
        const { itemIds, itemTypes } = data
        const userId = user.id

        if ( itemIds.length !== itemTypes.length ) {
            throw new Error( 'Mismatched item ids and types array lengths' )
        }

        const now = new Date()
        const fileIds: string[] = []
        const folderIds: string[] = []
        for ( let i = 0; i < itemIds.length; i++ ) {
            if ( itemTypes[i] === 'file' ) fileIds.push( itemIds[i] )
            else folderIds.push( itemIds[i] )
        }

        // Soft-delete files
        if ( fileIds.length > 0 ) {
            await db
                .update( storageFile )
                .set( { isDeleted: true, deletedAt: now } )
                .where(
                    and( inArray( storageFile.id, fileIds ), eq( storageFile.userId, userId ) ),
                )
        }

        if ( folderIds.length > 0 ) {
            const allFolderIds: string[] = [...folderIds]
            const visitedFolderIds = new Set<string>( folderIds )
            let toProcess: string[] = [...folderIds]
            let depth = 0

            while ( toProcess.length > 0 ) {
                const children = await db
                    .select( { id: folder.id } )
                    .from( folder )
                    .where(
                        and(
                            eq( folder.userId, userId ),
                            inArray( folder.parentFolderId, toProcess ),
                        ),
                    )
                const childIds = children
                    .map( ( c ) => c.id )
                    .filter( ( childId ) => {
                        if ( visitedFolderIds.has( childId ) ) {
                            return false
                        }

                        visitedFolderIds.add( childId )
                        return true
                    } )

                if ( childIds.length === 0 ) {
                    break
                }

                allFolderIds.push( ...childIds )
                toProcess = childIds
                depth += 1

                if ( depth > 1024 ) {
                    throw new Error( 'Folder deletion traversal exceeded safe depth' )
                }
            }

            await db
                .update( folder )
                .set( { isDeleted: true, deletedAt: now } )
                .where( and( inArray( folder.id, allFolderIds ), eq( folder.userId, userId ) ) )

            await db
                .update( storageFile )
                .set( { isDeleted: true, deletedAt: now } )
                .where(
                    and(
                        inArray( storageFile.folderId, allFolderIds ),
                        eq( storageFile.userId, userId ),
                    ),
                )
        }

        return { deletedFiles: fileIds.length, deletedFolders: folderIds.length }
    } )
