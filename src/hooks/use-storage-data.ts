import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react'
import { createClientOnlyFn } from '@tanstack/react-start'
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { STORAGE_QUERY_KEYS } from '@/lib/query-keys'
import { useStorageStore } from '@/stores/storage-store'
import { uploadStore, useUploadStore } from '@/lib/stores/upload-store'
import { mapBreadcrumbs, mapItems } from './storage-data-mapper'
import type { FetchResponse } from './storage-data-mapper'
import type {
  StorageItem,
  StorageFolder,
  UploadingFile,
  UserQuota,
  BreadcrumbItem,
} from '@/types/storage'
import type { HomeLoaderData } from '@/routes/-home-server'

const PAGE_LIMIT = 50

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
    usedStorage: data.usedStorage,
    allocatedStorage: data.allocatedStorage,
    fileSizeLimit: data.fileSizeLimit,
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
  const initialMapped = useMemo(
    () => mapInitialData(initialData),
    [initialData],
  )
  const queryClient = useQueryClient()
  const [isNavigating, startNavTransition] = useTransition()

  // Zustand store for cross-component access
  const store = useStorageStore()
  const skipFirstLoadRef = useRef(Boolean(initialMapped))

  // Upload store (global)
  const uploads = useUploadStore((state) => state.uploads)
  const setUploads = useCallback(
    (updater: React.SetStateAction<UploadingFile[]>) => {
      uploadStore.setState((current) => {
        const newUploads =
          typeof updater === 'function'
            ? (updater as (prev: UploadingFile[]) => UploadingFile[])(
                current.uploads,
              )
            : updater
        return { ...current, uploads: newUploads }
      })
    },
    [],
  )

  // Auth check
  useEffect(() => {
    if (initialMapped) {
      store.setUserId(initialMapped.userId)
      store.setTinySessionPermission(initialMapped.tinySessionPermission)
      return
    }
    void checkAuthClient().then((uid) => {
      if (!uid) return
      store.setUserId(uid)
    })
  }, [])

  const userId = store.userId
  const currentFolderId = store.currentFolderId
  const shouldUseInitialSnapshot =
    skipFirstLoadRef.current && currentFolderId === null && !!initialMapped

  const [optimisticItems, setOptimisticItems] = useState<StorageItem[] | null>(
    null,
  )

  // Infinite query for folder items
  const itemsQuery = useInfiniteQuery({
    queryKey: STORAGE_QUERY_KEYS.folderItems(currentFolderId),
    queryFn: async ({ pageParam = 1 }) => {
      if (!userId) throw new Error('Not authenticated')
      const data = await fetchFolderItems(
        currentFolderId,
        pageParam,
        PAGE_LIMIT,
      )
      return { data, page: pageParam }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const mapped = mapItems(lastPage.data, userId ?? '')
      if (mapped.items.length < PAGE_LIMIT) return undefined
      return lastPage.page + 1
    },
    enabled:
      !!userId && !(skipFirstLoadRef.current && currentFolderId === null),
    initialData: () => {
      if (
        skipFirstLoadRef.current &&
        currentFolderId === null &&
        initialMapped
      ) {
        return {
          pages: [
            {
              data: {
                folders: initialData?.folders,
                files: initialData?.files,
                breadcrumbs: initialData?.breadcrumbs,
              } as FetchResponse,
              page: 1,
            },
          ],
          pageParams: [1],
        }
      }
      return undefined
    },
  })

  // Quota query
  const quotaQuery = useQuery({
    queryKey: STORAGE_QUERY_KEYS.quota,
    queryFn: fetchUserQuota,
    enabled: !!userId,
    initialData: initialMapped?.quota ?? undefined,
    staleTime: 30_000,
  })

  type StorageViewData = {
    items: StorageItem[]
    folders: StorageFolder[]
    breadcrumbs: BreadcrumbItem[]
  }

  // Memoize flattened items from infinite query pages
  const storageViewData = useMemo<StorageViewData>(() => {
    const pages = itemsQuery.data?.pages ?? []

    if (pages.length === 0) {
      if (!shouldUseInitialSnapshot) {
        return {
          items: [],
          folders: [],
          breadcrumbs: [],
        }
      }

      const initialSnapshot = initialMapped
      return {
        items: initialSnapshot.items,
        folders: initialSnapshot.folders,
        breadcrumbs: initialSnapshot.breadcrumbs,
      }
    }

    const allItems: StorageItem[] = []
    const allFolders: StorageFolder[] = []
    const seenItemIds = new Set<string>()
    const seenFolderIds = new Set<string>()
    let latestBreadcrumbs: BreadcrumbItem[] = []
    const resolvedUserId = userId ?? initialMapped?.userId ?? ''

    for (const page of pages) {
      const mapped = mapItems(page.data, resolvedUserId)
      for (const item of mapped.items) {
        if (!seenItemIds.has(item.id)) {
          seenItemIds.add(item.id)
          allItems.push(item)
        }
      }
      for (const folder of mapped.folders) {
        if (!seenFolderIds.has(folder.id)) {
          seenFolderIds.add(folder.id)
          allFolders.push(folder)
        }
      }
      if (page.data.breadcrumbs) {
        latestBreadcrumbs = mapBreadcrumbs(page.data.breadcrumbs)
      }
    }

    return {
      items: allItems,
      folders: allFolders,
      breadcrumbs: latestBreadcrumbs,
    }
  }, [itemsQuery.data, userId, initialMapped, shouldUseInitialSnapshot])
  const { items, folders, breadcrumbs } = storageViewData

  // Sync to Zustand store using useLayoutEffect (before paint)
  useLayoutEffect(() => {
    store.setItems(optimisticItems ?? items)
    store.setFolders(folders)
    store.setBreadcrumbs(breadcrumbs)
  }, [optimisticItems, items, folders, breadcrumbs])

  useLayoutEffect(() => {
    store.setQuota(quotaQuery.data ?? null)
  }, [quotaQuery.data])

  useLayoutEffect(() => {
    store.setIsNavigating(isNavigating)
  }, [isNavigating])

  // Mark first load done
  useEffect(() => {
    if (skipFirstLoadRef.current) {
      skipFirstLoadRef.current = false
    }
  }, [])

  // Clear optimistic items when server data updates
  useEffect(() => {
    setOptimisticItems(null)
  }, [itemsQuery.data])

  const quota = useMemo(() => quotaQuery.data ?? null, [quotaQuery.data])

  // Navigate to folder with useTransition
  const setCurrentFolderId = useCallback(
    (id: string | null) => {
      setOptimisticItems(null)
      startNavTransition(() => {
        store.setCurrentFolderId(id)
      })
    },
    [store],
  )

  // setItems that both updates the query cache and the store
  const setItems = useCallback(
    (updater: React.SetStateAction<StorageItem[]>) => {
      const currentItems = useStorageStore.getState().items
      const nextItems =
        typeof updater === 'function' ? updater(currentItems) : updater
      store.setItems(nextItems)
      setOptimisticItems(nextItems)
    },
    [store],
  )

  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: STORAGE_QUERY_KEYS.folderItems(currentFolderId),
      }),
      queryClient.invalidateQueries({
        queryKey: STORAGE_QUERY_KEYS.quota,
      }),
    ])
  }, [queryClient, currentFolderId])

  const loadMore = useCallback(() => {
    if (itemsQuery.hasNextPage && !itemsQuery.isFetchingNextPage) {
      void itemsQuery.fetchNextPage()
    }
  }, [itemsQuery])

  const hasMore = useMemo(
    () => !!itemsQuery.hasNextPage,
    [itemsQuery.hasNextPage],
  )

  const isLoading =
    itemsQuery.isPending ||
    itemsQuery.fetchStatus === 'fetching' ||
    store.isNavigating

  const tinySessionPermission = useMemo(
    () => initialMapped?.tinySessionPermission,
    [initialMapped],
  )

  return {
    userId,
    items: optimisticItems ?? items,
    setItems,
    folders,
    uploads,
    setUploads,
    quota,
    setQuota: store.setQuota,
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
