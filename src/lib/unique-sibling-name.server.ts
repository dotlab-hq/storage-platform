import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder } from '@/db/schema/storage'

function buildParentCondition( parentFolderId: string | null ) {
    return parentFolderId === null
        ? isNull( folder.parentFolderId )
        : eq( folder.parentFolderId, parentFolderId )
}

function buildFileParentCondition( parentFolderId: string | null ) {
    return parentFolderId === null
        ? isNull( file.folderId )
        : eq( file.folderId, parentFolderId )
}

async function collectSiblingNames(
    userId: string,
    parentFolderId: string | null,
): Promise<Set<string>> {
    const [folderRows, fileRows] = await Promise.all( [
        db
            .select( { name: folder.name } )
            .from( folder )
            .where(
                and(
                    eq( folder.userId, userId ),
                    buildParentCondition( parentFolderId ),
                    eq( folder.isDeleted, false ),
                    eq( folder.isTrashed, false ),
                    isNull( folder.virtualBucketId ),
                ),
            ),
        db
            .select( { name: file.name } )
            .from( file )
            .where(
                and(
                    eq( file.userId, userId ),
                    buildFileParentCondition( parentFolderId ),
                    eq( file.isDeleted, false ),
                    eq( file.isTrashed, false ),
                ),
            ),
    ] )

    return new Set( [
        ...folderRows.map( ( row ) => row.name ),
        ...fileRows.map( ( row ) => row.name ),
    ] )
}

function splitFileName( fileName: string ) {
    const dotIndex = fileName.lastIndexOf( '.' )
    if ( dotIndex <= 0 || dotIndex === fileName.length - 1 ) {
        return { baseName: fileName, extension: '' }
    }

    return {
        baseName: fileName.slice( 0, dotIndex ),
        extension: fileName.slice( dotIndex ),
    }
}

function appendSuffix( name: string, counter: number ) {
    return `${name} (${counter})`
}

export async function resolveUniqueFolderName(
    userId: string,
    parentFolderId: string | null,
    desiredName: string,
): Promise<string> {
    const siblingNames = await collectSiblingNames( userId, parentFolderId )
    if ( !siblingNames.has( desiredName ) ) {
        return desiredName
    }

    let counter = 1
    while ( siblingNames.has( appendSuffix( desiredName, counter ) ) ) {
        counter += 1
    }

    return appendSuffix( desiredName, counter )
}

export async function resolveUniqueFileName(
    userId: string,
    parentFolderId: string | null,
    desiredName: string,
): Promise<string> {
    const siblingNames = await collectSiblingNames( userId, parentFolderId )
    if ( !siblingNames.has( desiredName ) ) {
        return desiredName
    }

    const { baseName, extension } = splitFileName( desiredName )
    let counter = 1
    let candidate = `${baseName} (${counter})${extension}`

    while ( siblingNames.has( candidate ) ) {
        counter += 1
        candidate = `${baseName} (${counter})${extension}`
    }

    return candidate
}