import { createHmac } from "node:crypto"
import { db } from "@/db"
import { virtualBucket } from "@/db/schema/s3-gateway"
import { and, eq } from "drizzle-orm"

export type BucketContext = {
    userId: string
    bucketId: string
    bucketName: string
    mappedFolderId: string | null
    createdAt: Date
}

type BucketRow = {
    userId: string
    id: string
    name: string
    mappedFolderId: string | null
    createdAt: Date
}

function signingSecret(): string {
    const secret = process.env.S3_GATEWAY_CREDENTIAL_SECRET ?? process.env.BETTER_AUTH_SECRET
    if ( !secret ) {
        throw new Error( "Missing credential signing secret" )
    }
    return secret
}

function accessKeyForBucket( bucketId: string ): string {
    return `sp_${bucketId.replaceAll( "-", "" ).slice( 0, 20 )}`
}

function secretForBucket( userId: string, bucketId: string, bucketName: string ): string {
    const digest = createHmac( "sha256", signingSecret() )
        .update( `${userId}:${bucketId}:${bucketName}` )
        .digest( "hex" )
    return `${digest}${digest.slice( 0, 24 )}`
}

function toContext( row: BucketRow ): BucketContext {
    return {
        userId: row.userId,
        bucketId: row.id,
        bucketName: row.name,
        mappedFolderId: row.mappedFolderId,
        createdAt: row.createdAt,
    }
}

export async function resolveBucketByName( bucketName: string ): Promise<BucketContext | null> {
    const rows = await db
        .select( {
            userId: virtualBucket.userId,
            id: virtualBucket.id,
            name: virtualBucket.name,
            mappedFolderId: virtualBucket.mappedFolderId,
            createdAt: virtualBucket.createdAt,
        } )
        .from( virtualBucket )
        .where( and( eq( virtualBucket.name, bucketName ), eq( virtualBucket.isActive, true ) ) )
        .limit( 1 )

    return rows[0] ? toContext( rows[0] ) : null
}

export async function resolveBucketByAccessKey( accessKeyId: string ): Promise<BucketContext | null> {
    const rows = await db
        .select( {
            userId: virtualBucket.userId,
            id: virtualBucket.id,
            name: virtualBucket.name,
            mappedFolderId: virtualBucket.mappedFolderId,
            createdAt: virtualBucket.createdAt,
        } )
        .from( virtualBucket )
        .where( eq( virtualBucket.isActive, true ) )

    const matched = rows.find( ( row ) => accessKeyForBucket( row.id ) === accessKeyId )
    return matched ? toContext( matched ) : null
}

export function parseAccessKeyId( request: Request ): string | null {
    const authorization = request.headers.get( "authorization" )
    if ( authorization ) {
        const credentialPart = authorization.split( "," ).map( ( part ) => part.trim() )
            .find( ( part ) => part.startsWith( "Credential=" ) )
        if ( credentialPart ) {
            const credential = credentialPart.slice( "Credential=".length )
            const accessKey = credential.split( "/" )[0]
            if ( accessKey ) {
                return accessKey
            }
        }
    }

    const url = new URL( request.url )
    const queryCredential = url.searchParams.get( "X-Amz-Credential" )
    if ( queryCredential ) {
        return queryCredential.split( "/" )[0] ?? null
    }

    return null
}

export function isSecretValid( bucket: BucketContext, secret: string ): boolean {
    return secretForBucket( bucket.userId, bucket.bucketId, bucket.bucketName ) === secret
}
