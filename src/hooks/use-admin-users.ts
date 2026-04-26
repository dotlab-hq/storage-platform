'use client'

import { useQuery } from '@tanstack/react-query'
import { getAdminUsersFn } from '@/routes/_app/admin/-admin-server'
import type { AdminUser } from '@/lib/storage-provider-queries'

export function useAdminUsers(initialData?: AdminUser[]) {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAdminUsersFn(),
    initialData,
    staleTime: 10_000, // 10 seconds
  })
}
