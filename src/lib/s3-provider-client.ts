import { S3Client } from "@aws-sdk/client-s3"
import { db } from "@/db"
import { file } from "@/db/schema/storage"
import { storageProvider } from "@/db/schema/storage-provider"
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
        throw new Error( "S3 provider is not configured" )
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
    return {
        providerId: row.id,
        providerName: row.name,
        bucketName: row.bucketName,
        client: new S3Client( {
            region: row.region,
            endpoint: row.endpoint,
            forcePathStyle: true,
            bucketEndpoint: false,
            credentials: {
                accessKeyId: decryptProviderSecret( row.accessKeyIdEncrypted ),
                secretAccessKey: decryptProviderSecret( row.secretAccessKeyEncrypted ),
            },
        } ),
    }
}

export async function getProviderClientById( providerId: string | null ): Promise<ProviderClientConfig> {
    if ( !providerId ) {
        return fromEnvironment()
    }
    const [provider] = await db
        .select()
        .from( storageProvider )
        .where( and( eq( storageProvider.id, providerId ), eq( storageProvider.isActive, true ) ) )
        .limit( 1 )
    if ( !provider ) {
        throw new Error( "Storage provider not found or inactive" )
    }
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
            usedBytes: sql<number>`COALESCE(SUM(${file.sizeInBytes}), 0)::bigint`,
        } )
        .from( file )
        .where( and( eq( file.isDeleted, false ), isNotNull( file.providerId ) ) )
        .groupBy( file.providerId )
    const usageByProvider = new Map( usageRows.map( ( row ) => [row.providerId ?? "", row.usedBytes ?? 0] ) )

    const eligible = providers
        .map( ( provider ) => {
            const used = usageByProvider.get( provider.id ) ?? 0
            const available = provider.storageLimitBytes - used
            return { provider, available }
        } )
        .filter( ( item ) => item.available >= incomingFileSize )
        .sort( ( a, b ) => b.available - a.available )

    if ( eligible.length === 0 ) {
        throw new Error( "No storage provider has enough available capacity for this upload" )
    }

    return fromProviderRow( eligible[0].provider )
}
