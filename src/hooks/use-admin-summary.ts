'use client'

import { useQuery } from '@tanstack/react-query'
import { getAdminSummaryFn } from '@/routes/_app/admin/-admin-server'
import type { AdminSummary } from '@/lib/storage-provider-queries'

export function useAdminSummary(initialData?: AdminSummary) {
  return useQuery({
    queryKey: ['admin-summary'],
    queryFn: () => getAdminSummaryFn(),
    initialData,
    staleTime: 10_000,
  })
}
