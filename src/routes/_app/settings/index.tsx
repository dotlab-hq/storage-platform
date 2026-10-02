import { createFileRoute } from '@tanstack/react-router'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { settingsQuery, userProvidersQuery } from './-components/settings-query'
import { SETTINGS_TABS, SettingsPage } from './-components/settings-page'
import type { SettingsTab } from './-components/settings-page'
import { SettingsPageSkeleton } from './-components/settings-page-skeleton'

type SettingsSearch = {
  /** The open tab; omitted for the default (profile) tab. */
  tab?: SettingsTab
}

function parseTab(value: unknown): SettingsTab | undefined {
  return SETTINGS_TABS.find((tab) => tab.id === value)?.id
}

export const Route = createFileRoute('/_app/settings/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  validateSearch: (search: Record<string, unknown>): SettingsSearch => ({
    tab: parseTab(search.tab),
  }),
  // Every tab reads these with suspense queries, so prefetch both up front:
  // switching tabs then never waits on the network.
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(settingsQuery()),
      queryClient.ensureQueryData(userProvidersQuery()),
    ])
  },
  pendingComponent: SettingsPageSkeleton,
  component: SettingsPage,
})
