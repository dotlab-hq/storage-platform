import { createServerFn } from '@tanstack/react-start'
import { and, count, eq, sum, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { createServiceContext } from '@/lib/services/base-service'
import { StorageService } from '@/lib/services/storage-service'
import { db } from '@/db'
import { file, folder, userStorage } from '@/db/schema/storage'
import { storageProvider } from '@/db/schema/storage-provider'
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
  tinySessionPermission?: 'read' | 'read-write'
}

export const getHomeSnapshotFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<HomeLoaderData> => {
    const ctx = await createServiceContext()
    const service = new StorageService(ctx)
    const quota = await service.getUserQuota()

    // Use btree-based listing for performance
    const items = await service.listFolderItems({
      folderId: null,
      page: 1,
      limit: 1000,
    })

    return {
      userId: ctx.userId,
      folders: items.items
        .filter((i) => i.itemType === 'folder')
        .map((folder) => ({
          id: folder.itemId,
          name: folder.name,
          createdAt: folder.createdAt.toISOString(),
          parentFolderId: folder.parentFolderId,
          isPrivatelyLocked: false,
        })),
      files: items.items
        .filter((i) => i.itemType === 'file')
        .map((file) => ({
          id: file.itemId,
          name: file.name,
          sizeInBytes: file.size || 0,
          mimeType: file.mimeType || null,
          objectKey: undefined,
          createdAt: file.createdAt.toISOString(),
          isPrivatelyLocked: false,
        })),
      breadcrumbs: [],
      quota,
      tinySessionPermission: 'read-write' as const,
    }
  },
)

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
