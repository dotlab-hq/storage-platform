import { queryOptions } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { SETTINGS_QUERY_KEYS } from '@/lib/query-keys'
import { getSettingsSnapshotFn } from './settings-snapshot'
import { getUserProvidersFn } from './-providers-server'

/**
 * Query definitions for the Settings page. The route loader ensures both are
 * cached, and the sections read them with `useSuspenseQuery`, so every tab
 * renders complete on the first paint.
 */

export type SettingsSnapshot = Awaited<ReturnType<typeof getSettingsSnapshotFn>>

/** Profile, security, linked accounts, sessions and provider preference. */
export function settingsQuery() {
  return queryOptions({
    queryKey: SETTINGS_QUERY_KEYS.snapshot,
    queryFn: () => getSettingsSnapshotFn(),
  })
}

/** The user's own storage providers with usage. */
export function userProvidersQuery() {
  return queryOptions({
    queryKey: SETTINGS_QUERY_KEYS.userProviders,
    queryFn: () => getUserProvidersFn(),
  })
}

/** Applies a partial update to the cached snapshot (optimistic updates). */
export function updateSettingsSnapshot(
  queryClient: QueryClient,
  update: (snapshot: SettingsSnapshot) => SettingsSnapshot,
) {
  queryClient.setQueryData(settingsQuery().queryKey, (snapshot) =>
    snapshot ? update(snapshot) : snapshot,
  )
}

/** Refetches the settings snapshot. */
export function refreshSettings(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: SETTINGS_QUERY_KEYS.snapshot,
  })
}
