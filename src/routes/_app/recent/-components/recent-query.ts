import { queryOptions } from '@tanstack/react-query'
import { RECENT_QUERY_KEYS } from '@/lib/query-keys'
import { getRecentSnapshotFn } from './-recent-server'

/** Items the user opened or created recently (preloaded by the route loader). */
export function recentItemsQuery() {
  return queryOptions({
    queryKey: RECENT_QUERY_KEYS.items,
    queryFn: async () => {
      const { items } = await getRecentSnapshotFn()
      return items
    },
  })
}
