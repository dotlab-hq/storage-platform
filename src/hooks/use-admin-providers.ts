'use client'

import { useQuery } from '@tanstack/react-query'
import { getAdminProvidersFn } from '@/routes/_app/admin/-admin-server'
import type { AdminProvider } from '@/lib/storage-provider-queries'

export function useAdminProviders(initialData?: AdminProvider[]) {
  return useQuery({
    queryKey: ['admin-providers'],
    queryFn: () => getAdminProvidersFn(),
    initialData,
    staleTime: 10_000,
  })
}
