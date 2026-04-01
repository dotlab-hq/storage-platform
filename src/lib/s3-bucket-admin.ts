import {
    CreateBucketCommand,
    DeleteBucketCommand,
    DeleteObjectsCommand,
    ListBucketsCommand,
    ListObjectsV2Command,
} from "@aws-sdk/client-s3"
import type { _Object } from "@aws-sdk/client-s3"
import { getProviderClientById } from "@/lib/s3-provider-client"
import type { S3BucketItem } from "@/types/s3-buckets"

function mapBucketItem( bucket: { Name?: string; CreationDate?: Date } ): S3BucketItem | null {
    if ( !bucket.Name ) {
        return null
    }

    return {
        name: bucket.Name,
        createdAt: bucket.CreationDate ? bucket.CreationDate.toISOString() : null,
    }
}

export async function listBuckets(): Promise<S3BucketItem[]> {
    const provider = await getProviderClientById( null )
    const response = await provider.client.send( new ListBucketsCommand( {} ) )

    return ( response.Buckets ?? [] )
        .map( mapBucketItem )
        .filter( ( bucket ): bucket is S3BucketItem => bucket !== null )
        .sort( ( a, b ) => a.name.localeCompare( b.name ) )
}

export async function createBucket( bucketName: string ): Promise<S3BucketItem> {
    const provider = await getProviderClientById( null )
    await provider.client.send( new CreateBucketCommand( { Bucket: bucketName } ) )

    return {
        name: bucketName,
        createdAt: new Date().toISOString(),
    }
}

function toObjectIdentifier( objectItem: _Object ): { Key: string } | null {
    if ( !objectItem.Key ) {
        return null
    }

    return { Key: objectItem.Key }
}

export async function emptyBucket( bucketName: string ): Promise<void> {
    const provider = await getProviderClientById( null )

    let continuationToken: string | undefined
    do {
        const listed = await provider.client.send( new ListObjectsV2Command( {
            Bucket: bucketName,
            ContinuationToken: continuationToken,
            MaxKeys: 1000,
        } ) )

        const objectKeys = ( listed.Contents ?? [] )
            .map( toObjectIdentifier )
            .filter( ( item ): item is { Key: string } => item !== null )

        if ( objectKeys.length > 0 ) {
            await provider.client.send( new DeleteObjectsCommand( {
                Bucket: bucketName,
                Delete: {
                    Objects: objectKeys,
                    Quiet: true,
                },
            } ) )
        }

        continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined
    } while ( continuationToken )
}

export async function deleteBucket( bucketName: string ): Promise<void> {
    const provider = await getProviderClientById( null )
    await provider.client.send( new DeleteBucketCommand( { Bucket: bucketName } ) )
}
