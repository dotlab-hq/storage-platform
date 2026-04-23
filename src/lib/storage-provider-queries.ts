import { user } from '@/db/schema/auth-schema'
import { file } from '@/db/schema/storage'
import { storageProvider } from '@/db/schema/storage-provider'
import { count, eq, sql, sum } from 'drizzle-orm'

async function loadDb() {
  const { db } = await import('@/db')
  return db
}

function toNonNegativeBytes(value: number | string | null | undefined): number {
  const parsed = typeof value === 'string' ? Number(value) : value
  if (typeof parsed !== 'number' || !Number.isFinite(parsed)) {
    return 0
  }
  return Math.max(0, parsed)
}

export async function listProvidersWithUsage() {
  const db = await loadDb()
  const providers = await db
    .select({
      id: storageProvider.id,
      name: storageProvider.name,
      region: storageProvider.region,
      endpoint: storageProvider.endpoint,
      bucketName: storageProvider.bucketName,
      storageLimitBytes: storageProvider.storageLimitBytes,
      fileSizeLimitBytes: storageProvider.fileSizeLimitBytes,
      proxyUploadsEnabled: storageProvider.proxyUploadsEnabled,
      isActive: storageProvider.isActive,
      createdAt: storageProvider.createdAt,
    })
    .from(storageProvider)

  const usageByProvider = await db
    .select({
      providerId: file.providerId,
      usedBytes: sum(file.sizeInBytes).mapWith(Number),
    })
    .from(file)
    .where(eq(file.isDeleted, false))
    .groupBy(file.providerId)

  const usageMap = new Map(
    usageByProvider.map((row) => [
      row.providerId ?? 'unassigned',
      toNonNegativeBytes(row.usedBytes),
    ]),
  )

  return providers.map((provider) => {
    const storageLimitBytes = toNonNegativeBytes(provider.storageLimitBytes)
    const fileSizeLimitBytes = toNonNegativeBytes(provider.fileSizeLimitBytes)
    const usedStorageBytes = usageMap.get(provider.id) ?? 0
    const availableStorageBytes = Math.max(
      0,
      storageLimitBytes - usedStorageBytes,
    )
    return {
      ...provider,
      storageLimitBytes,
      fileSizeLimitBytes,
      usedStorageBytes,
      availableStorageBytes,
    }
  })
}

export type AdminProvider = Awaited<
  ReturnType<typeof listProvidersWithUsage>
>[number]
export type AdminSummary = Awaited<ReturnType<typeof getStorageAdminSummary>>
export type AdminUser = Awaited<ReturnType<typeof getUsersWithUsage>>[number]

export async function getStorageAdminSummary() {
  const db = await loadDb()
  const [providerCountRow] = await db
    .select({
      count: count(),
    })
    .from(storageProvider)
  const [userCountRow] = await db
    .select({
      count: count(),
    })
    .from(user)
  const [totalUsedRow] = await db
    .select({ total: sum(file.sizeInBytes).mapWith(Number) })
    .from(file)
    .where(eq(file.isDeleted, false))
  const providerCount = Number(providerCountRow?.count ?? 0)
  const userCount = Number(userCountRow?.count ?? 0)
  const totalUsedStorageBytes = toNonNegativeBytes(totalUsedRow.total)
  return {
    providerCount,
    userCount,
    totalUsedStorageBytes,
  }
}

export async function getUsersWithUsage() {
  const db = await loadDb()
  const rows = await db.all<{
    id: string
    name: string
    email: string
    isAdmin: boolean
    role: string | null
    banned: boolean
    usedStorage: number | string | null
    createdAt: number
  }>(sql`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.is_admin AS "isAdmin",
          u.role,
          u.banned,
          COALESCE(SUM(f.size_in_bytes), 0) AS "usedStorage",
          u.created_at AS "createdAt"
        FROM "user" u
        LEFT JOIN "file" f ON f.user_id = u.id AND f.is_deleted = false
        GROUP BY u.id, u.name, u.email, u.is_admin, u.role, u.banned, u.created_at
        ORDER BY u.created_at DESC
    `)
  return rows.map((row) => ({
    ...row,
    usedStorage: toNonNegativeBytes(row.usedStorage),
  }))
}
