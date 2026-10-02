import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import {
  getAdminProvidersFn,
  getAdminSummaryFn,
  getAdminUsersFn,
} from '@/routes/_app/admin/-components/-admin-provider-fns'
import { ADMIN_QUERY_KEYS } from '@/lib/query-keys'

/**
 * Query definitions for the admin dashboard. The route loader prefetches all
 * three; the page reads them back with `useSuspenseQuery`, and mutations
 * invalidate them through `refreshAdminQueries`.
 */

/** Every user with their storage usage and limits. */
export function adminUsersQuery() {
  return queryOptions({
    queryKey: ADMIN_QUERY_KEYS.users,
    queryFn: () => getAdminUsersFn(),
  })
}

/** Global (admin-managed) storage providers with their usage. */
export function adminProvidersQuery() {
  return queryOptions({
    queryKey: ADMIN_QUERY_KEYS.providers,
    queryFn: () => getAdminProvidersFn(),
  })
}

/** Provider count, user count and total storage used. */
export function adminSummaryQuery() {
  return queryOptions({
    queryKey: ADMIN_QUERY_KEYS.summary,
    queryFn: () => getAdminSummaryFn(),
  })
}

export type AdminQueryName = 'users' | 'providers' | 'summary'

/** Refetches the given admin queries after a mutation. */
export function refreshAdminQueries(
  queryClient: QueryClient,
  names: AdminQueryName[],
) {
  return Promise.all(
    names.map((name) =>
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS[name] }),
    ),
  )
}
