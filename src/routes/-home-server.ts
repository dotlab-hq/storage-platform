import { createServerFn } from '@tanstack/react-start'
import { and, count, eq, sum, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { createServiceContext } from '@/lib/services/base-service'
import { StorageService } from '@/lib/services/storage-service'
import { db } from '@/db'
import { file, folder, userStorage } from '@/db/schema/storage'
import { storageProvider } from '@/db/schema/storage-provider'
import { decodeNavToken } from '@/lib/nav-token'
import { getFolderBreadcrumbs } from '@/lib/storage-queries'
import { DEFAULT_ALLOCATED_STORAGE_BYTES } from '@/lib/storage-quota-constants'
import type { UserQuota } from '@/types/storage'

type HomeRawFolder = {
  id: string
  name: string
  createdAt: string
  parentFolderId: string | null
  isPrivatelyLocked?: boolean
}

type HomeRawFile = {
  id: string
  name: string
  sizeInBytes: number
  mimeType?: string | null
  objectKey?: string
  createdAt: string
  isPrivatelyLocked?: boolean
}

export type HomeLoaderData = {
  userId: string
  folders: HomeRawFolder[]
  files: HomeRawFile[]
  breadcrumbs: { id: string; name: string }[]
  quota: UserQuota
  currentFolderId: string | null
  tinySessionPermission?: 'read' | 'read-write'
}

const HomeSnapshotSchema = z.object({
  nav: z.string().optional(),
})

function resolveNavFolderId(nav?: string): string | null {
  if (!nav) return null
  const decoded = decodeNavToken(nav)
  return decoded?.folderId ?? null
}

export const getHomeSnapshotFn = createServerFn({ method: 'GET' })
  .inputValidator(HomeSnapshotSchema)
  .handler(async ({ data }): Promise<HomeLoaderData> => {
    const ctx = await createServiceContext()
    const service = new StorageService(ctx)
    const quota = await service.getUserQuota()
    const requestedFolderId = resolveNavFolderId(data.nav)
    const folderRow = requestedFolderId
      ? await db.query.folder.findFirst({
          where: and(
            eq(folder.id, requestedFolderId),
            eq(folder.userId, ctx.userId),
            eq(folder.isDeleted, false),
            eq(folder.isTrashed, false),
            isNull(folder.virtualBucketId),
          ),
        })
      : null
    const currentFolderId = folderRow?.id ?? null

    // Use btree-based listing for performance
    const items = await service.listFolderItems({
      folderId: currentFolderId,
      page: 1,
      limit: 1000,
    })

    const breadcrumbs = currentFolderId
      ? await getFolderBreadcrumbs(ctx.userId, currentFolderId)
      : []

    // Filter out folders that belong to a virtual bucket
    const folderItems = items.items.filter((i) => i.itemType === 'folder')
    const folderIds = folderItems.map((f) => f.itemId)

    let nonVirtualFolderIds: Set<string> = new Set(folderIds)
    if (folderIds.length > 0) {
      const virtualFolders = await db.query.folder.findMany({
        where: and(
          eq(folder.userId, ctx.userId),
          // Get folders with virtualBucketId (virtual buckets)
        ),
        columns: { id: true, virtualBucketId: true },
      })

      const virtualBucketFolderIds = new Set(
        virtualFolders
          .filter((f) => f.virtualBucketId !== null)
          .map((f) => f.id),
      )

      nonVirtualFolderIds = new Set(
        folderIds.filter((id) => !virtualBucketFolderIds.has(id)),
      )
    }

    return {
      userId: ctx.userId,
      folders: items.items
        .filter(
          (i) =>
            i.itemType === 'folder' && nonVirtualFolderIds.has(i.itemId),
        )
        .map((folderItem) => ({
          id: folderItem.itemId,
          name: folderItem.name,
          createdAt: folderItem.createdAt.toISOString(),
          parentFolderId: folderItem.parentFolderId,
          isPrivatelyLocked: false,
        })),
      files: items.items
        .filter((i) => i.itemType === 'file')
        .map((fileItem) => ({
          id: fileItem.itemId,
          name: fileItem.name,
          sizeInBytes: fileItem.size || 0,
          mimeType: fileItem.mimeType || null,
          objectKey: undefined,
          createdAt: fileItem.createdAt.toISOString(),
          isPrivatelyLocked: false,
        })),
      breadcrumbs,
      quota,
      currentFolderId,
      tinySessionPermission: 'read-write' as const,
    }
  })

export type HomeDashboardData = {
  fileCount: number
  folderCount: number
  storageUsed: number
  storageAllocated: number
  providerCount: number
}

export const getHomeDashboardDataFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<HomeDashboardData> => {
    const ctx = await createServiceContext()
    const service = new StorageService(ctx)
    const quota = await service.getUserQuota()

    // Count files and folders via btree for performance
    const allItems = await service.listFolderItems({
      folderId: null,
      page: 1,
      limit: 10000,
    })
    const fileCount = allItems.items.filter((i) => i.itemType === 'file').length
    const folderCount = allItems.items.filter(
      (i) => i.itemType === 'folder',
    ).length
    const storageUsed = allItems.items
      .filter((i) => i.itemType === 'file')
      .reduce((acc, f) => acc + (f.size || 0), 0)

    // Provider count - kept as direct query for now (admin-level data)
    const [providerCountRows] = await db
      .select({ count: count() })
      .from(storageProvider)
      .limit(1)
    const providerCount = Number(providerCountRows?.count ?? 0)

    return {
      fileCount,
      folderCount,
      storageUsed,
      storageAllocated: quota.allocatedStorage,
      providerCount,
    }
  },
)

export type FolderStatsData = {
  fileCount: number
  folderCount: number
  storageUsed: number
}

const FolderStatsSchema = z.object({
  folderId: z.string().nullable().optional(),
})

export const getFolderStatsFn = createServerFn({ method: 'GET' })
  .inputValidator(FolderStatsSchema)
  .handler(async ({ data }) => {
    const ctx = await createServiceContext()
    const service = new StorageService(ctx)

    // Use btree-based listing for performance
    const allItems = await service.listFolderItems({
      folderId: data.folderId ?? null,
      page: 1,
      limit: 10000,
    })

    const fileCount = allItems.items.filter((i) => i.itemType === 'file').length
    const folderCount = allItems.items.filter(
      (i) => i.itemType === 'folder',
    ).length
    const storageUsed = allItems.items
      .filter((i) => i.itemType === 'file')
      .reduce((acc, f) => acc + (f.size || 0), 0)

    return { fileCount, folderCount, storageUsed }
  })
