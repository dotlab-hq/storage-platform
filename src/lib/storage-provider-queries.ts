import { db } from "@/db"
import { file } from "@/db/schema/storage"
import { storageProvider } from "@/db/schema/storage-provider"
import { count, eq, sql, sum } from "drizzle-orm"

const FALLBACK_PROVIDER_NAME = "Default Provider"

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

    const usageMap = new Map( usageByProvider.map( ( row ) => [row.providerId ?? "unassigned", row.usedBytes ?? 0] ) )
    const defaultUsed = usageMap.get( "unassigned" ) ?? 0

    const mappedProviders = providers.map( ( provider ) => ( {
        ...provider,
        usedStorageBytes: usageMap.get( provider.id ) ?? 0,
    } ) )
    return [
        {
            id: "default-provider",
            name: FALLBACK_PROVIDER_NAME,
            region: process.env.S3_REGION ?? "unknown",
            endpoint: process.env.S3_ENDPOINT ?? "unknown",
            bucketName: process.env.S3_BUCKET_NAME ?? "dot-storage",
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
    return {
        providerCount: ( providerCountRow?.count ?? 0 ) + 1,
        userCount: userCountRows.rows[0]?.count ?? 0,
        totalUsedStorageBytes: totalUsedRow?.total ?? 0,
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
