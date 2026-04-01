import { createHmac } from "node:crypto"
import { db } from "@/db"
import { virtualBucket } from "@/db/schema/s3-gateway"
import { folder, file, userStorage } from "@/db/schema/storage"
import type { S3BucketCredentials, S3BucketItem } from "@/types/s3-buckets"
import { and, eq, like, sql } from "drizzle-orm"

function toBucketItem( row: {
    id: string
    name: string
    mappedFolderId: string | null
    isActive: boolean
    createdAt: Date
} ): S3BucketItem {
    return {
        id: row.id,
        name: row.name,
        mappedFolderId: row.mappedFolderId,
        isActive: row.isActive,
        createdAt: row.createdAt.toISOString(),
    }
}

function resolveCredentialSecret(): string {
    const secret = process.env.S3_GATEWAY_CREDENTIAL_SECRET ?? process.env.BETTER_AUTH_SECRET
    if ( !secret ) {
        throw new Error( "Missing credential signing secret" )
    }
    return secret
}

function createBucketCredentials( userId: string, bucketId: string, bucketName: string ): S3BucketCredentials {
    const digest = createHmac( "sha256", resolveCredentialSecret() )
        .update( `${userId}:${bucketId}:${bucketName}` )
        .digest( "hex" )
    const compactBucketId = bucketId.replaceAll( "-", "" ).slice( 0, 20 )

    return {
        accessKeyId: `sp_${compactBucketId}`,
        secretAccessKey: `${digest}${digest.slice( 0, 24 )}`,
        endpoint: process.env.S3_ENDPOINT ?? "",
        region: process.env.S3_REGION ?? "us-east-1",
        bucket: bucketName,
    }
}

export async function listVirtualBuckets( userId: string ): Promise<S3BucketItem[]> {
    const rows = await db
        .select( {
            id: virtualBucket.id,
            name: virtualBucket.name,
            mappedFolderId: virtualBucket.mappedFolderId,
            isActive: virtualBucket.isActive,
            createdAt: virtualBucket.createdAt,
        } )
        .from( virtualBucket )
        .where( and( eq( virtualBucket.userId, userId ), eq( virtualBucket.isActive, true ) ) )
        .orderBy( virtualBucket.createdAt )

    return rows.map( toBucketItem )
}

export async function createVirtualBucket( userId: string, bucketName: string ): Promise<S3BucketItem> {
    const createdFolders = await db.insert( folder ).values( {
        userId,
        name: bucketName,
        parentFolderId: null,
    } ).returning( { id: folder.id } )

    const createdRows = await db.insert( virtualBucket ).values( {
        userId,
        name: bucketName,
        mappedFolderId: createdFolders[0].id,
        isActive: true,
    } ).returning( {
        id: virtualBucket.id,
        name: virtualBucket.name,
        mappedFolderId: virtualBucket.mappedFolderId,
        isActive: virtualBucket.isActive,
        createdAt: virtualBucket.createdAt,
    } )

    return toBucketItem( createdRows[0] )
}

export async function emptyVirtualBucket( userId: string, bucketName: string ): Promise<void> {
    const bucketRows = await db
        .select( { id: virtualBucket.id } )
        .from( virtualBucket )
        .where( and( eq( virtualBucket.userId, userId ), eq( virtualBucket.name, bucketName ), eq( virtualBucket.isActive, true ) ) )
        .limit( 1 )

    if ( bucketRows.length === 0 ) {
        throw new Error( "Virtual bucket not found" )
    }

    const prefix = `s3/${userId}/${bucketRows[0].id}/%`
    const activeFiles = await db
        .select( {
            id: file.id,
            sizeInBytes: file.sizeInBytes,
        } )
        .from( file )
        .where( and( eq( file.userId, userId ), eq( file.isDeleted, false ), like( file.objectKey, prefix ) ) )

    if ( activeFiles.length === 0 ) {
        return
    }

    const totalBytes = activeFiles.reduce( ( sum, item ) => sum + item.sizeInBytes, 0 )
    const now = new Date()

    await db
        .update( file )
        .set( { isDeleted: true, deletedAt: now } )
        .where( and( eq( file.userId, userId ), eq( file.isDeleted, false ), like( file.objectKey, prefix ) ) )

    const storageRows = await db
        .select( { usedStorage: userStorage.usedStorage } )
        .from( userStorage )
        .where( eq( userStorage.userId, userId ) )
        .limit( 1 )

    if ( storageRows.length > 0 ) {
        const nextUsed = Math.max( 0, storageRows[0].usedStorage - totalBytes )
        await db.update( userStorage ).set( { usedStorage: nextUsed } ).where( eq( userStorage.userId, userId ) )
    }
}

export async function deleteVirtualBucket( userId: string, bucketName: string ): Promise<void> {
    const bucketRows = await db
        .select( {
            id: virtualBucket.id,
            mappedFolderId: virtualBucket.mappedFolderId,
        } )
        .from( virtualBucket )
        .where( and( eq( virtualBucket.userId, userId ), eq( virtualBucket.name, bucketName ), eq( virtualBucket.isActive, true ) ) )
        .limit( 1 )

    if ( bucketRows.length === 0 ) {
        throw new Error( "Virtual bucket not found" )
    }

    const prefix = `s3/${userId}/${bucketRows[0].id}/%`
    const countRows = await db
        .select( { count: sql<number>`count(*)::int` } )
        .from( file )
        .where( and( eq( file.userId, userId ), eq( file.isDeleted, false ), like( file.objectKey, prefix ) ) )

    if ( ( countRows[0]?.count ?? 0 ) > 0 ) {
        throw new Error( "Bucket is not empty. Empty it before deleting." )
    }

    await db.update( virtualBucket ).set( { isActive: false } ).where( eq( virtualBucket.id, bucketRows[0].id ) )

    if ( bucketRows[0].mappedFolderId ) {
        await db.update( folder )
            .set( { isDeleted: true, deletedAt: new Date() } )
            .where( and( eq( folder.id, bucketRows[0].mappedFolderId ), eq( folder.userId, userId ) ) )
    }
}

export async function getVirtualBucketCredentials( userId: string, bucketName: string ): Promise<S3BucketCredentials> {
    const rows = await db
        .select( {
            id: virtualBucket.id,
            name: virtualBucket.name,
        } )
        .from( virtualBucket )
        .where( and( eq( virtualBucket.userId, userId ), eq( virtualBucket.name, bucketName ), eq( virtualBucket.isActive, true ) ) )
        .limit( 1 )

    if ( rows.length === 0 ) {
        throw new Error( "Virtual bucket not found" )
    }

    return createBucketCredentials( userId, rows[0].id, rows[0].name )
}
