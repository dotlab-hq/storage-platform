import { createServerFn } from '@tanstack/react-start'
import { count, eq, sum } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { listFolderItems } from '@/lib/storage-queries'
import { getUserQuotaSnapshotByUserId } from '@/lib/server-functions/quota.server'
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
    const currentUser = await getAuthenticatedUser()
    const [items, quota] = await Promise.all([
      listFolderItems(currentUser.id, null),
      getUserQuotaSnapshotByUserId(currentUser.id),
    ])

    return {
      userId: currentUser.id,
      folders: items.folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        createdAt: folder.createdAt.toISOString(),
        parentFolderId: folder.parentFolderId,
        isPrivatelyLocked: Boolean(folder.isPrivatelyLocked),
      })),
      files: items.files.map((file) => ({
        id: file.id,
        name: file.name,
        sizeInBytes: file.sizeInBytes,
        mimeType: file.mimeType,
        objectKey: file.objectKey,
        createdAt: file.createdAt.toISOString(),
        isPrivatelyLocked: Boolean(file.isPrivatelyLocked),
      })),
      breadcrumbs: [],
      quota,
      tinySessionPermission: currentUser.tinySessionPermission,
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
    const currentUser = await getAuthenticatedUser()
    const [
      fileCountRow,
      folderCountRow,
      storageSumRow,
      storageQuotaRow,
      providerCountRow,
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(file)
        .where(eq(file.userId, currentUser.id), eq(file.isDeleted, false))
        .limit(1),
      db
        .select({ count: count() })
        .from(folder)
        .where(eq(folder.userId, currentUser.id), eq(folder.isDeleted, false))
        .limit(1),
      db
        .select({ sum: sum(file.sizeInBytes) })
        .where(eq(file.userId, currentUser.id), eq(file.isDeleted, false))
        .limit(1),
      db
        .select({
          usedStorage: userStorage.usedStorage,
          allocatedStorage: userStorage.allocatedStorage,
        })
        .where(eq(userStorage.userId, currentUser.id))
        .limit(1),
      db.select({ count: count() }).from(storageProvider).limit(1),
    ])

    const fileCount = Number(fileCountRow?.count ?? 0)
    const folderCount = Number(folderCountRow?.count ?? 0)
    const storageUsed = storageSumRow?.sum
      ? typeof storageSumRow.sum === 'bigint'
        ? Number(storageSumRow.sum)
        : Number(storageSumRow.sum)
      : 0
    const storageAllocated =
      storageQuotaRow?.allocatedStorage ?? DEFAULT_ALLOCATED_STORAGE_BYTES
    const providerCount = Number(providerCountRow?.count ?? 0)

    return {
      fileCount,
      folderCount,
      storageUsed,
      storageAllocated,
      providerCount,
    }
  },
)
