import { db } from "@/db"
import { file } from "@/db/schema/storage"
import { storageProvider } from "@/db/schema/storage-provider"
import { DEFAULT_PROVIDER_ID, UNDETERMINED_PROVIDER_VALUE } from "@/lib/storage-provider-constants"
import { count, eq, sql, sum } from "drizzle-orm"

const FALLBACK_PROVIDER_NAME = "Default Provider"
const FALLBACK_PROVIDER_BUCKET_NAME = process.env.S3_BUCKET_NAME || "dot-storage"
const FALLBACK_PROVIDER_REGION = process.env.S3_REGION || "not-configured"
const FALLBACK_PROVIDER_ENDPOINT = process.env.S3_ENDPOINT || "not-configured"
const FALLBACK_PROVIDER_LIMIT_BYTES = Number.MAX_SAFE_INTEGER

export async function listProvidersWithUsage() {
    const providers = await db
        .select( {
            id: storageProvider.id,
            name: storageProvider.name,
            region: storageProvider.region,
            endpoint: storageProvider.endpoint,
            bucketName: storageProvider.bucketName,
            storageLimitBytes: storageProvider.storageLimitBytes,
            isActive: storageProvider.isActive,
            createdAt: storageProvider.createdAt,
        } )
        .from( storageProvider )

    const usageByProvider = await db
        .select( {
            providerId: file.providerId,
            usedBytes: sum( file.sizeInBytes ).mapWith( Number ),
        } )
        .from( file )
        .where( eq( file.isDeleted, false ) )
        .groupBy( file.providerId )

    const usageMap = new Map( usageByProvider.map( ( row ) => [row.providerId ?? "unassigned", row.usedBytes] ) )
    const defaultUsed = usageMap.get( "unassigned" ) || 0

    const mappedProviders = providers.map( ( provider ) => {
        const usedStorageBytes = usageMap.get( provider.id ) ?? 0
        const availableStorageBytes = provider.storageLimitBytes - usedStorageBytes
        return { ...provider, usedStorageBytes, availableStorageBytes }
    } )
    const existingDefault = mappedProviders.find( ( provider ) => provider.id === DEFAULT_PROVIDER_ID || provider.name === FALLBACK_PROVIDER_NAME )
    if ( existingDefault ) {
        return mappedProviders
    }
    return [{
        id: DEFAULT_PROVIDER_ID,
        name: FALLBACK_PROVIDER_NAME,
        region: process.env.S3_REGION ?? UNDETERMINED_PROVIDER_VALUE,
        endpoint: process.env.S3_ENDPOINT ?? UNDETERMINED_PROVIDER_VALUE,
        bucketName: process.env.S3_BUCKET_NAME ?? UNDETERMINED_PROVIDER_VALUE,
        storageLimitBytes: FALLBACK_PROVIDER_LIMIT_BYTES,
        isActive: true,
        createdAt: new Date(),
        usedStorageBytes: defaultUsed,
        availableStorageBytes: FALLBACK_PROVIDER_LIMIT_BYTES,
    }, ...mappedProviders]
}

export type AdminProvider = Awaited<ReturnType<typeof listProvidersWithUsage>>[number]
export type AdminSummary = Awaited<ReturnType<typeof getStorageAdminSummary>>
export type AdminUser = Awaited<ReturnType<typeof getUsersWithUsage>>[number]

export async function getStorageAdminSummary() {
    const [providerCountRow] = await db
        .select( { count: count() } )
        .from( storageProvider )
    const userCountRows = await db.execute<{ count: number }>( sql`SELECT COUNT(*)::int AS count FROM "dot-storage"."user"` )
    const [totalUsedRow] = await db
        .select( { total: sum( file.sizeInBytes ).mapWith( Number ) } )
        .from( file )
        .where( eq( file.isDeleted, false ) )
    const providerCount = providerCountRow.count
    const userCount = userCountRows.rows[0].count
    const totalUsedStorageBytes = totalUsedRow.total || 0
    return {
        providerCount,
        userCount,
        totalUsedStorageBytes,
    }
}

export async function getUsersWithUsage() {
    const rows = await db.execute<{
        id: string
        name: string
        email: string
        isAdmin: boolean
        usedStorage: number
    }>( sql`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.is_admin AS "isAdmin",
          COALESCE(SUM(f.size_in_bytes), 0)::bigint AS "usedStorage"
        FROM "dot-storage"."user" u
        LEFT JOIN "dot-storage"."file" f ON f.user_id = u.id AND f.is_deleted = false
        GROUP BY u.id, u.name, u.email, u.is_admin
        ORDER BY u.created_at DESC
    ` )
    return rows.rows
}
