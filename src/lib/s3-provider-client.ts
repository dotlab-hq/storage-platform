import { S3Client } from "@aws-sdk/client-s3"
import { file } from "@/db/schema/storage"
import { storageProvider } from "@/db/schema/storage-provider"
import { UNDETERMINED_PROVIDER_VALUE } from "@/lib/storage-provider-constants"
import { decryptProviderSecret } from "@/lib/provider-crypto"
import { and, eq, isNotNull, sql } from "drizzle-orm"

type ProviderClientConfig = {
    providerId: string | null
    providerName: string
    bucketName: string
    endpoint: string
    client: S3Client
}

type ProviderRow = typeof storageProvider.$inferSelect

const DEFAULT_PROVIDER_NAME = "default provider"
const MAIN_PROVIDER_NAME = "main"

async function loadDb() {
    const { db } = await import( "@/db" )
    return db
}

async function getDefaultActiveProvider(): Promise<ProviderRow | null> {
    const db = await loadDb()
    const providerRows = await db
        .select()
        .from( storageProvider )
        .where( eq( storageProvider.isActive, true ) )
        .orderBy(
            sql`CASE
                WHEN lower(${storageProvider.name}) = ${DEFAULT_PROVIDER_NAME} THEN 0
                WHEN lower(${storageProvider.name}) = ${MAIN_PROVIDER_NAME} THEN 1
                ELSE 2
            END`,
            storageProvider.createdAt,
            storageProvider.id,
        )
        .limit( 1 )

    if ( providerRows.length === 0 ) {
        return null
    }

    return providerRows[0]
}

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
        endpoint,
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
        endpoint,
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
    const db = await loadDb()
    if ( !providerId ) {
        const defaultProvider = await getDefaultActiveProvider()
        if ( defaultProvider ) {
            return fromProviderRow( defaultProvider )
        }
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

export async function resolveProviderId( providerId: string | null | undefined ): Promise<string | null> {
    if ( providerId ) {
        return providerId
    }

    const defaultProvider = await getDefaultActiveProvider()
    if ( !defaultProvider ) {
        return null
    }

    return defaultProvider.id
}

export async function selectProviderForUpload( incomingFileSize: number ): Promise<ProviderClientConfig> {
    const db = await loadDb()
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
            usedBytes: sql<number>`COALESCE(SUM(${file.sizeInBytes}), 0)`,
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
        .filter( ( item ) => item.available >= incomingFileSize && item.provider.fileSizeLimitBytes >= incomingFileSize )
        .sort( ( a, b ) => b.available - a.available )

    if ( eligible.length === 0 ) {
        throw new Error( "No available storage provider can accept this file size and capacity" )
    }

    return fromProviderRow( eligible[0].provider )
}
