import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import type { AdminProviderContentsResponse } from '@/lib/admin-provider-browser'
import {
  getProviderObjectUrl,
  loadProviderContents,
} from '@/components/admin/provider-contents-client'

export function useProviderContents(
  providerId: string | null,
  open: boolean,
  scope: 'admin' | 'user' = 'admin',
) {
  const [prefix, setPrefix] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!open || !providerId) {
      setPrefix('')
      setSearchQuery('')
    }
  }, [open, providerId])

  const query = useInfiniteQuery({
    queryKey: ['provider-contents', scope, providerId, prefix, searchQuery],
    enabled: open && providerId !== null,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      if (!providerId) {
        throw new Error('Provider is required')
      }
      return loadProviderContents({
        providerId,
        prefix,
        continuationToken: pageParam,
        scope,
        searchQuery,
      })
    },
    getNextPageParam: (lastPage) =>
      lastPage.isTruncated ? lastPage.nextContinuationToken : undefined,
    staleTime: 15_000,
  })

  const breadcrumbs = useMemo(() => {
    const parts = prefix.split('/').filter((part) => part.length > 0)
    return parts.map((part, index) => ({
      label: part,
      value: `${parts.slice(0, index + 1).join('/')}/`,
    }))
  }, [prefix])

  const folders = useMemo(() => {
    const seen = new Set<string>()
    const mergedFolders: AdminProviderContentsResponse['folders'] = []

    for (const page of query.data?.pages ?? []) {
      for (const folder of page.folders) {
        if (seen.has(folder.prefix)) {
          continue
        }
        seen.add(folder.prefix)
        mergedFolders.push(folder)
      }
    }

    return mergedFolders
  }, [query.data?.pages])

  const files = useMemo(() => {
    const seen = new Set<string>()
    const mergedFiles: AdminProviderContentsResponse['files'] = []

    for (const page of query.data?.pages ?? []) {
      for (const file of page.files) {
        if (seen.has(file.key)) {
          continue
        }
        seen.add(file.key)
        mergedFiles.push(file)
      }
    }

    return mergedFiles
  }, [query.data?.pages])

  const latestPage = query.data?.pages.at(-1) ?? null

  return {
    prefix,
    setPrefix,
    breadcrumbs,
    contents: latestPage,
    folders,
    files,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    error: query.error,
    refresh: async () => {
      await query.refetch()
    },
    loadMore: async () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        await query.fetchNextPage()
      }
    },
    openFile: async (objectKey: string) => {
      if (!providerId) {
        throw new Error('Provider is required')
      }
      const url = await getProviderObjectUrl({ providerId, objectKey, scope })
      window.open(url, '_blank', 'noopener,noreferrer')
    },
    setSearchQuery,
  }
}

export type UseProviderContentsResult = ReturnType<typeof useProviderContents>
