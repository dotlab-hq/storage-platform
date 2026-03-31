import { db } from "@/db"
import { file } from "@/db/schema/storage"
import { storageProvider } from "@/db/schema/storage-provider"
import { count, eq, sql, sum } from "drizzle-orm"

const FALLBACK_PROVIDER_NAME = "Default Provider"
const FALLBACK_PROVIDER_BUCKET_NAME = process.env.S3_BUCKET_NAME || "dot-storage"
const FALLBACK_PROVIDER_REGION = process.env.S3_REGION || "not-configured"
const FALLBACK_PROVIDER_ENDPOINT = process.env.S3_ENDPOINT || "not-configured"

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

    const mappedProviders = providers.map( ( provider ) => ( {
        ...provider,
        usedStorageBytes: usageMap.get( provider.id ) ?? 0,
    } ) )
    return [
        {
            id: "default-provider",
            name: FALLBACK_PROVIDER_NAME,
            region: FALLBACK_PROVIDER_REGION,
            endpoint: FALLBACK_PROVIDER_ENDPOINT,
            bucketName: FALLBACK_PROVIDER_BUCKET_NAME,
            storageLimitBytes: Number.MAX_SAFE_INTEGER,
            isActive: true,
            createdAt: new Date(),
            usedStorageBytes: defaultUsed,
        },
        ...mappedProviders,
    ]
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
    const providerCount = providerCountRow.count + 1
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
