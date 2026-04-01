import { db } from "@/db"
import { file } from "@/db/schema/storage"
import { storageProvider } from "@/db/schema/storage-provider"
import { count, eq, sql, sum } from "drizzle-orm"

function toNonNegativeBytes( value: number | string | null | undefined ): number {
    const parsed = typeof value === "string" ? Number( value ) : value
    if ( typeof parsed !== "number" || !Number.isFinite( parsed ) ) {
        return 0
    }
    return Math.max( 0, parsed )
}

export async function listProvidersWithUsage() {
    const providers = await db
        .select( {
            id: storageProvider.id,
            name: storageProvider.name,
            region: storageProvider.region,
            endpoint: storageProvider.endpoint,
            bucketName: storageProvider.bucketName,
            storageLimitBytes: storageProvider.storageLimitBytes,
            fileSizeLimitBytes: storageProvider.fileSizeLimitBytes,
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

    const usageMap = new Map( usageByProvider.map( ( row ) => [row.providerId ?? "unassigned", toNonNegativeBytes( row.usedBytes )] ) )

    return providers.map( ( provider ) => {
        const storageLimitBytes = toNonNegativeBytes( provider.storageLimitBytes )
        const fileSizeLimitBytes = toNonNegativeBytes( provider.fileSizeLimitBytes )
        const usedStorageBytes = usageMap.get( provider.id ) ?? 0
        const availableStorageBytes = Math.max( 0, storageLimitBytes - usedStorageBytes )
        return {
            ...provider,
            storageLimitBytes,
            fileSizeLimitBytes,
            usedStorageBytes,
            availableStorageBytes,
        }
    } )
}

export type AdminProvider = Awaited<ReturnType<typeof listProvidersWithUsage>>[number]
export type AdminSummary = Awaited<ReturnType<typeof getStorageAdminSummary>>
export type AdminUser = Awaited<ReturnType<typeof getUsersWithUsage>>[number]

export async function getStorageAdminSummary() {
    const [providerCountRow] = await db
        .select( {
            count: count(),
        } )
        .from( storageProvider )
    const userCountRows = await db.execute<{ count: number }>( sql`SELECT COUNT(*)::int AS count FROM "dot-storage"."user"` )
    const [totalUsedRow] = await db
        .select( { total: sum( file.sizeInBytes ).mapWith( Number ) } )
        .from( file )
        .where( eq( file.isDeleted, false ) )
    const providerCount = providerCountRow.count
    const userCount = userCountRows.rows[0].count
    const totalUsedStorageBytes = toNonNegativeBytes( totalUsedRow.total )
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
        usedStorage: number | string | null
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
    return rows.rows.map( ( row ) => ( {
        ...row,
        usedStorage: toNonNegativeBytes( row.usedStorage ),
    } ) )
}
