import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { listFolderItems, getFolderBreadcrumbs } from '@/lib/storage-queries'
import { touchFolderOpenedFn } from '@/lib/storage/mutations/touch'
import { getAuthenticatedUser } from '@/lib/server-auth.server'
import { eq } from 'drizzle-orm'
import { Cache } from '@/lib/Cache'
import {
  DEFAULT_ALLOCATED_STORAGE_BYTES,
  DEFAULT_FILE_SIZE_LIMIT_BYTES,
} from '@/lib/storage-quota-constants'

type CachedFolderItems = {
  folders: Array<{
    id: string
    name: string
    createdAt: Date
    parentFolderId: string | null
    isPrivatelyLocked?: boolean
  }>
  files: Array<{
    id: string
    name: string
    sizeInBytes: number
    mimeType: string | null
    objectKey: string
    createdAt: Date
    isPrivatelyLocked?: boolean
  }>
  breadcrumbs: Array<{ id: string; name: string }>
}

type CachedQuota = {
  usedStorage: number
  allocatedStorage: number
  fileSizeLimit: number
}

const FolderItemsSchema = z.object({
  folderId: z.string().nullable().optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(100),
})

export const getFolderItemsFn = createServerFn({ method: 'GET' })
  .inputValidator(FolderItemsSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const folderId = data.folderId ?? null
    const page = data.page ?? 1
    const limit = data.limit ?? 100

    const cacheKey = `items:${user.id}:${folderId ?? 'root'}:p${page}:l${limit}`
    const cached = await Cache.get<CachedFolderItems>(cacheKey)
    if (cached) {
      if (folderId) {
        void touchFolderOpenedFn({ data: { folderId } }).catch(() => {})
      }
      return cached
    }

    const items = await listFolderItems(user.id, folderId, limit, page)

    let breadcrumbs: { id: string; name: string }[] = []
    if (folderId) {
      breadcrumbs = await getFolderBreadcrumbs(user.id, folderId)
      void touchFolderOpenedFn({ data: { folderId } }).catch(() => {})
    }

    const result = { ...items, breadcrumbs }

    // Cache for 60 seconds (can be invalidated explicitly on mutations)
    await Cache.set(cacheKey, result, { expirationTtl: 60 })

    return result
  })

function toNonNegativeBytes(
  value: number | null | undefined,
  fallback: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }
  return Math.max(0, value)
}

export const getQuotaFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getAuthenticatedUser()
    const userId = user.id

    const cacheKey = `quota:${userId}`
    const cached = await Cache.get<CachedQuota>(cacheKey)
    if (cached) return cached

    const [{ db }, { userStorage }] = await Promise.all([
      import('@/db'),
      import('@/db/schema/storage'),
    ])

    let [row] = await db
      .select({
        usedStorage: userStorage.usedStorage,
        allocatedStorage: userStorage.allocatedStorage,
        fileSizeLimit: userStorage.fileSizeLimit,
      })
      .from(userStorage)
      .where(eq(userStorage.userId, userId))
      .limit(1)

    if (!row) {
      const [inserted] = await db
        .insert(userStorage)
        .values({
          userId,
          allocatedStorage: DEFAULT_ALLOCATED_STORAGE_BYTES,
          fileSizeLimit: DEFAULT_FILE_SIZE_LIMIT_BYTES,
          usedStorage: 0,
        })
        .onConflictDoNothing()
        .returning({
          usedStorage: userStorage.usedStorage,
          allocatedStorage: userStorage.allocatedStorage,
          fileSizeLimit: userStorage.fileSizeLimit,
        })
      row = inserted ?? {
        usedStorage: 0,
        allocatedStorage: DEFAULT_ALLOCATED_STORAGE_BYTES,
        fileSizeLimit: DEFAULT_FILE_SIZE_LIMIT_BYTES,
      }
    }

    const result = {
      usedStorage: toNonNegativeBytes(row.usedStorage, 0),
      allocatedStorage: toNonNegativeBytes(
        row.allocatedStorage,
        DEFAULT_ALLOCATED_STORAGE_BYTES,
      ),
      fileSizeLimit: toNonNegativeBytes(
        row.fileSizeLimit,
        DEFAULT_FILE_SIZE_LIMIT_BYTES,
      ),
    }

    await Cache.set(cacheKey, result, { expirationTtl: 300 }) // 5 min cache

    return result
  },
)

export const getAllFoldersFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getAuthenticatedUser()
    const { getAllFolders } = await import('@/lib/storage-queries')
    const folders = await getAllFolders(user.id)
    return { folders }
  },
)

const SearchItemsSchema = z.object({ query: z.string() })

export const searchItemsFn = createServerFn({ method: 'GET' })
  .inputValidator(SearchItemsSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const { searchItems } = await import('@/lib/storage-queries')
    if (!data.query || data.query.trim().length === 0) {
      return { folders: [], files: [] }
    }
    const results = await searchItems(user.id, data.query.trim())
    return results
  })
