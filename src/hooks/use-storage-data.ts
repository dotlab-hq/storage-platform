import { useCallback, useEffect, useRef, useState } from 'react'
import { createClientOnlyFn } from '@tanstack/react-start'
import { authClient } from '@/lib/auth-client'
import {
  DEFAULT_ALLOCATED_STORAGE_BYTES,
  DEFAULT_FILE_SIZE_LIMIT_BYTES,
} from '@/lib/storage-quota-constants'
import type { HomeLoaderData } from '@/routes/-home-server'
import { mapBreadcrumbs, mapItems } from './storage-data-mapper'
import type { FetchResponse } from './storage-data-mapper'
import type {
  StorageItem,
  StorageFolder,
  UploadingFile,
  UserQuota,
  BreadcrumbItem,
} from '@/types/storage'

// Dynamically load server functions to reduce initial client bundle
async function loadGetFolderItemsFn() {
  const mod = await import('@/lib/storage/queries/server')
  return mod.getFolderItemsFn
}

async function loadGetQuotaFn() {
  const mod = await import('@/lib/storage/queries/server')
  return mod.getQuotaFn
}

const checkAuthClient = createClientOnlyFn(async () => {
  const { data, error } = await authClient.getSession()
  if (error || !data?.user) {
    window.location.href = '/auth'
    return null
  }
  return data.user.id
})

const fetchFolderItems = createClientOnlyFn(
  async (folderId: string | null, page: number = 1, limit: number = 100) => {
    const getFolderItemsFn = await loadGetFolderItemsFn()
    const data = await getFolderItemsFn({ data: { folderId, page, limit } })
    return data as unknown as FetchResponse
  },
)

const fetchUserQuota = createClientOnlyFn(async (): Promise<UserQuota> => {
  const getQuotaFn = await loadGetQuotaFn()
  const data = await getQuotaFn()
  return {
    usedStorage: data.usedStorage ?? 0,
    allocatedStorage: data.allocatedStorage ?? DEFAULT_ALLOCATED_STORAGE_BYTES,
    fileSizeLimit: data.fileSizeLimit ?? DEFAULT_FILE_SIZE_LIMIT_BYTES,
  }
})

function mapInitialData(initialData?: HomeLoaderData) {
  if (!initialData) return null

  const mapped = mapItems(
    {
      folders: initialData.folders,
      files: initialData.files,
      breadcrumbs: initialData.breadcrumbs,
    },
    initialData.userId,
  )

  return {
    userId: initialData.userId,
    items: mapped.items,
    folders: mapped.folders,
    breadcrumbs: mapBreadcrumbs(initialData.breadcrumbs),
    quota: initialData.quota,
    tinySessionPermission: initialData.tinySessionPermission,
  }
}

export function useStorageData(initialData?: HomeLoaderData) {
  const initialMapped = mapInitialData(initialData)

  const skipFirstLoadRef = useRef(Boolean(initialMapped))
  const [userId, setUserId] = useState<string | null>(
    initialMapped?.userId ?? null,
  )
  const [items, setItems] = useState<StorageItem[]>(initialMapped?.items ?? [])
  const [folders, setFolders] = useState<StorageFolder[]>(
    initialMapped?.folders ?? [],
  )
  const [uploads, setUploads] = useState<UploadingFile[]>([])
  const [quota, setQuota] = useState<UserQuota | null>(
    initialMapped?.quota ?? null,
  )
  const [isLoading, setIsLoading] = useState(!initialMapped)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>(
    initialMapped?.breadcrumbs ?? [],
  )
  const [tinySessionPermission] = useState<'read' | 'read-write' | undefined>(
    initialMapped?.tinySessionPermission ?? undefined,
  )

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const limit = 50

  const loadItems = useCallback(
    async (uid: string, folderId: string | null, reset: boolean = true) => {
      setIsLoading(true)
      try {
        const targetPage = reset ? 1 : page + 1
        const data = await fetchFolderItems(folderId, targetPage, limit)
        const mapped = mapItems(data, uid)

        if (reset) {
          setItems(mapped.items)
          setFolders(mapped.folders)
          setPage(1)
        } else {
          setItems((prev) => {
            const newItems = mapped.items.filter(
              (i) => !prev.some((p) => p.id === i.id),
            )
            return [...prev, ...newItems]
          })
          setFolders((prev) => {
            const newFolders = mapped.folders.filter(
              (f) => !prev.some((p) => p.id === f.id),
            )
            return [...prev, ...newFolders]
          })
          setPage(targetPage)
        }

        if (mapped.items.length < limit) {
          setHasMore(false)
        } else {
          setHasMore(true)
        }

        setBreadcrumbs(mapBreadcrumbs(data.breadcrumbs ?? []))
      } finally {
        setIsLoading(false)
      }
    },
    [page, limit],
  )

  const loadQuota = useCallback(async () => {
    try {
      const q = await fetchUserQuota()
      setQuota(q)
    } catch {
      // quota fetch is non-critical; leave as null
    }
  }, [])

  useEffect(() => {
    if (initialMapped) return
    void checkAuthClient().then(async (uid) => {
      if (!uid) return
      setUserId(uid)
      await loadQuota()
    })
  }, [initialMapped, loadQuota])

  useEffect(() => {
    if (!userId) return
    if (skipFirstLoadRef.current) {
      skipFirstLoadRef.current = false
      return
    }
    void loadItems(userId, currentFolderId, true)
  }, [currentFolderId, userId, loadItems])

  const refresh = useCallback(async () => {
    if (userId) {
      await Promise.all([loadItems(userId, currentFolderId, true), loadQuota()])
    }
  }, [userId, currentFolderId, loadItems, loadQuota])

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore && userId) {
      void loadItems(userId, currentFolderId, false)
    }
  }, [isLoading, hasMore, userId, currentFolderId, loadItems])

  return {
    userId,
    items,
    setItems,
    folders,
    uploads,
    setUploads,
    quota,
    setQuota,
    isLoading,
    currentFolderId,
    setCurrentFolderId,
    breadcrumbs,
    refresh,
    loadMore,
    hasMore,
    tinySessionPermission,
  }
}
