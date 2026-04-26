import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUserQuotaSnapshotFn } from '@/lib/server-functions/quota'
import { STORAGE_QUERY_KEYS } from '@/lib/query-keys'
import type { UserQuota } from '@/types/storage'

export function useQuota() {
  const { data } = useQuery<UserQuota>({
    queryKey: STORAGE_QUERY_KEYS.quota,
    queryFn: getUserQuotaSnapshotFn,
    staleTime: 30_000,
    retry: 2,
  })

  return useMemo(() => data ?? null, [data])
}
