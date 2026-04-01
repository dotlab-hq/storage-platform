import { S3Client } from "@aws-sdk/client-s3"
import { db } from "@/db"
import { file } from "@/db/schema/storage"
import { storageProvider } from "@/db/schema/storage-provider"
import { UNDETERMINED_PROVIDER_VALUE } from "@/lib/storage-provider-constants"
import { decryptProviderSecret } from "@/lib/provider-crypto"
import { and, eq, isNotNull, sql } from "drizzle-orm"

type ProviderClientConfig = {
    providerId: string | null
    providerName: string
    bucketName: string
    client: S3Client
}

type ProviderRow = typeof storageProvider.$inferSelect

function fromEnvironment(): ProviderClientConfig {
    const accessKeyId = process.env.S3_ACCESS_KEY_ID
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
    const region = process.env.S3_REGION
    const endpoint = process.env.S3_ENDPOINT
    if ( !accessKeyId || !secretAccessKey || !region || !endpoint ) {
        throw new Error( "No storage provider exists for uploads" )
    }
    return {
        providerId: null,
        providerName: "Default Provider",
        bucketName: process.env.S3_BUCKET_NAME ?? "dot-storage",
        client: new S3Client( {
            region,
            endpoint,
            forcePathStyle: true,
            bucketEndpoint: false,
            credentials: { accessKeyId, secretAccessKey },
        } ),
    }
}

function fromProviderRow( row: ProviderRow ): ProviderClientConfig {
    const accessKeyId = row.accessKeyIdEncrypted === UNDETERMINED_PROVIDER_VALUE
        ? process.env.S3_ACCESS_KEY_ID
        : decryptProviderSecret( row.accessKeyIdEncrypted )
    const secretAccessKey = row.secretAccessKeyEncrypted === UNDETERMINED_PROVIDER_VALUE
        ? process.env.S3_SECRET_ACCESS_KEY
        : decryptProviderSecret( row.secretAccessKeyEncrypted )
    const region = row.region === UNDETERMINED_PROVIDER_VALUE ? process.env.S3_REGION : row.region
    const endpoint = row.endpoint === UNDETERMINED_PROVIDER_VALUE ? process.env.S3_ENDPOINT : row.endpoint
    if ( !accessKeyId || !secretAccessKey || !region || !endpoint ) {
        const missing: string[] = []
        if ( !accessKeyId ) missing.push( "accessKeyId" )
        if ( !secretAccessKey ) missing.push( "secretAccessKey" )
        if ( !region ) missing.push( "region" )
        if ( !endpoint ) missing.push( "endpoint" )
        throw new Error( `Storage provider "${row.name}" is missing required credentials: ${missing}` )
    }
    return {
        providerId: row.id,
        providerName: row.name,
        bucketName: row.bucketName === UNDETERMINED_PROVIDER_VALUE ? ( process.env.S3_BUCKET_NAME ?? "dot-storage" ) : row.bucketName,
        client: new S3Client( {
            region,
            endpoint,
            forcePathStyle: true,
            bucketEndpoint: false,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        } ),
    }
}

export async function getProviderClientById( providerId: string | null ): Promise<ProviderClientConfig> {
    if ( !providerId ) {
        return fromEnvironment()
    }
    const providerRows = await db
        .select()
        .from( storageProvider )
        .where( eq( storageProvider.id, providerId ) )
        .limit( 1 )
    if ( providerRows.length === 0 ) {
        throw new Error( "Storage provider not found" )
    }
    const provider = providerRows[0]
    return fromProviderRow( provider )
}

export async function selectProviderForUpload( incomingFileSize: number ): Promise<ProviderClientConfig> {
    const providers = await db
        .select()
        .from( storageProvider )
        .where( eq( storageProvider.isActive, true ) )

    if ( providers.length === 0 ) {
        return fromEnvironment()
    }

    const usageRows = await db
        .select( {
            providerId: file.providerId,
            usedBytes: sql<number>`COALESCE(SUM(${file.sizeInBytes}), 0)::int8`,
        } )
        .from( file )
        .where( and( eq( file.isDeleted, false ), isNotNull( file.providerId ) ) )
        .groupBy( file.providerId )
    const usageByProvider = new Map( usageRows.map( ( row ) => [row.providerId ?? "", row.usedBytes] ) )

    const eligible = providers
        .map( ( provider ) => {
            const used = usageByProvider.get( provider.id ) ?? 0
            const available = provider.storageLimitBytes - used
            return { provider, available }
        } )
        .filter( ( item ) => item.available >= incomingFileSize )
        .sort( ( a, b ) => b.available - a.available )

    if ( eligible.length === 0 ) {
        throw new Error( "No available storage provider has enough capacity for this upload" )
    }

    return fromProviderRow( eligible[0].provider )
}
