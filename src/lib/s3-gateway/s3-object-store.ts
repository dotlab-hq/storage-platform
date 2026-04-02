import {
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3"
import { db } from "@/db"
import { file } from "@/db/schema/storage"
import type { BucketContext } from "@/lib/s3-gateway/s3-context"
import { getProviderClientById, selectProviderForUpload } from "@/lib/s3-provider-client"
import { and, eq, like } from "drizzle-orm"
import { sendWithProviderTimeout } from "./s3-provider-timeout"
import { upsertCommittedFile } from "./upload-file-records"
import { buildUpstreamObjectKey, deriveFileName } from "./upload-key-utils"

function upstreamKeyFor( bucket: BucketContext, objectKey: string ): string {
    return buildUpstreamObjectKey( bucket.userId, bucket.bucketId, objectKey )
}

function bucketPrefix( bucket: BucketContext ): string {
    return `s3/${bucket.userId}/${bucket.bucketId}/`
}

export type ListedS3Object = {
    key: string
    size: number
    eTag: string | null
    lastModified: Date
}

export async function listObjectsV2( bucket: BucketContext, prefix: string ): Promise<ListedS3Object[]> {
    const basePrefix = bucketPrefix( bucket )
    const rows = await db
        .select( {
            objectKey: file.objectKey,
            sizeInBytes: file.sizeInBytes,
            updatedAt: file.updatedAt,
        } )
        .from( file )
        .where( and( eq( file.userId, bucket.userId ), eq( file.isDeleted, false ), like( file.objectKey, `${basePrefix}%` ) ) )

    return rows
        .map( ( row ) => {
            const key = row.objectKey.startsWith( basePrefix )
                ? row.objectKey.slice( basePrefix.length )
                : row.objectKey
            return {
                key,
                size: row.sizeInBytes,
                eTag: null,
                lastModified: row.updatedAt,
            }
        } )
        .filter( ( row ) => row.key.startsWith( prefix ) )
}

export async function putObject( bucket: BucketContext, objectKey: string, body: Uint8Array, contentType: string | null ): Promise<string | null> {
    const provider = await selectProviderForUpload( body.byteLength )
    const upstreamKey = upstreamKeyFor( bucket, objectKey )

    const result = await sendWithProviderTimeout( ( abortSignal ) => provider.client.send( new PutObjectCommand( {
        Bucket: provider.bucketName,
        Key: upstreamKey,
        Body: body,
        ContentType: contentType ?? "application/octet-stream",
    } ), { abortSignal } ) )

    await upsertCommittedFile( {
        userId: bucket.userId,
        providerId: provider.providerId,
        objectKey: upstreamKey,
        contentType,
        mappedFolderId: bucket.mappedFolderId,
        fileName: deriveFileName( objectKey ),
        sizeInBytes: body.byteLength,
    } )

    return result.ETag ?? null
}

type StoredObject = {
    objectKey: string
    providerId: string | null
    mimeType: string | null
    sizeInBytes: number
}

async function findStoredObject( bucket: BucketContext, objectKey: string ): Promise<StoredObject | null> {
    const upstreamKey = upstreamKeyFor( bucket, objectKey )
    const rows = await db
        .select( {
            objectKey: file.objectKey,
            providerId: file.providerId,
            mimeType: file.mimeType,
            sizeInBytes: file.sizeInBytes,
        } )
        .from( file )
        .where( and( eq( file.userId, bucket.userId ), eq( file.objectKey, upstreamKey ), eq( file.isDeleted, false ) ) )
        .limit( 1 )

    return rows[0] ?? null
}

export async function getObject( bucket: BucketContext, objectKey: string ): Promise<Response | null> {
    const stored = await findStoredObject( bucket, objectKey )
    if ( !stored ) {
        return null
    }

    const provider = await getProviderClientById( stored.providerId )
    const result = await sendWithProviderTimeout( ( abortSignal ) => provider.client.send( new GetObjectCommand( {
        Bucket: provider.bucketName,
        Key: stored.objectKey,
    } ), { abortSignal } ) )

    return new Response( result.Body as ReadableStream, {
        status: 200,
        headers: {
            "Content-Type": stored.mimeType ?? "application/octet-stream",
            "Content-Length": String( stored.sizeInBytes ),
            ETag: result.ETag ?? "",
        },
    } )
}

export async function headObject( bucket: BucketContext, objectKey: string ): Promise<Response | null> {
    const stored = await findStoredObject( bucket, objectKey )
    if ( !stored ) {
        return null
    }

    const provider = await getProviderClientById( stored.providerId )
    const result = await sendWithProviderTimeout( ( abortSignal ) => provider.client.send( new HeadObjectCommand( {
        Bucket: provider.bucketName,
        Key: stored.objectKey,
    } ), { abortSignal } ) )

    return new Response( null, {
        status: 200,
        headers: {
            "Content-Type": stored.mimeType ?? "application/octet-stream",
            "Content-Length": String( result.ContentLength ?? stored.sizeInBytes ),
            ETag: result.ETag ?? "",
        },
    } )
}

export async function deleteObject( bucket: BucketContext, objectKey: string ): Promise<void> {
    const upstreamKey = upstreamKeyFor( bucket, objectKey )
    await db
        .update( file )
        .set( {
            isDeleted: true,
            deletedAt: new Date(),
        } )
        .where( and( eq( file.userId, bucket.userId ), eq( file.objectKey, upstreamKey ), eq( file.isDeleted, false ) ) )
}
