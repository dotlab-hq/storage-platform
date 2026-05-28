import { useCallback, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import type {
  S3ListResponse,
  S3ViewerFileEntry,
  S3ViewerFolderEntry,
} from '@/components/storage/s3-viewer-types'

type UseS3ViewerQueryParams = {
  bucketName: string
  prefix: string
  setPrefix: (value: string) => void
  initialData?: S3ListResponse
  skipFirstLoad: boolean
}

export function useS3ViewerQuery({
  bucketName,
  prefix,
  setPrefix,
  initialData,
  skipFirstLoad,
}: UseS3ViewerQueryParams) {
  const queryKey = useMemo(
    () => ['s3-viewer', bucketName, prefix],
    [bucketName, prefix],
  )

  const query = useInfiniteQuery<S3ListResponse>({
    queryKey,
    enabled: !!bucketName && !skipFirstLoad,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams()
      params.append('bucketName', bucketName)
      params.append('maxKeys', '500')
      if (prefix) {
        params.append('prefix', prefix)
      }
      if (typeof pageParam === 'string' && pageParam.length > 0) {
        params.append('continuationToken', pageParam)
      }
      const res = await fetch(`/api/storage/s3/bucket-items?${params}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        const err = await res
          .json()
          .then((d: unknown) => {
            if (typeof d === 'object' && d !== null && 'error' in d) {
              const errorValue = (d as { error?: unknown }).error
              return typeof errorValue === 'string'
                ? errorValue
                : 'Failed to load bucket content'
            }
            return 'Failed to load bucket content'
          })
          .catch(() => 'Failed to load bucket content')
        throw new Error(err)
      }
      return res.json()
    },
    getNextPageParam: (lastPage) =>
      lastPage.isTruncated ? lastPage.nextContinuationToken : undefined,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [null],
        }
      : undefined,
    staleTime: 30_000,
  })

  const folders = useMemo<S3ViewerFolderEntry[]>(() => {
    const seen = new Set<string>()
    const merged: S3ListResponse['folders'] = []
    for (const page of query.data?.pages ?? []) {
      for (const folder of page.folders) {
        if (!seen.has(folder.prefix)) {
          seen.add(folder.prefix)
          merged.push(folder)
        }
      }
    }
    return merged
  }, [query.data?.pages])

  const files = useMemo<S3ViewerFileEntry[]>(() => {
    const seen = new Set<string>()
    const merged: S3ListResponse['objects'] = []
    for (const page of query.data?.pages ?? []) {
      for (const file of page.objects) {
        if (!seen.has(file.key)) {
          seen.add(file.key)
          merged.push(file)
        }
      }
    }
    return merged
  }, [query.data?.pages])

  const breadcrumbs = useMemo(() => {
    const parts = prefix.split('/').filter((part) => part.length > 0)
    return parts.map((part, index) => ({
      label: part,
      value: `${parts.slice(0, index + 1).join('/')}/`,
    }))
  }, [prefix])

  const refresh = useCallback(
    async (nextPrefix?: string) => {
      const targetPrefix = typeof nextPrefix === 'string' ? nextPrefix : prefix
      if (targetPrefix !== prefix) {
        setPrefix(targetPrefix)
      } else {
        await query.refetch()
      }
    },
    [prefix, query, setPrefix],
  )

  const loadMore = useCallback(async () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      await query.fetchNextPage()
    }
  }, [query])

  return {
    queryKey,
    query,
    folders,
    files,
    breadcrumbs,
    refresh,
    loadMore,
  }
}
