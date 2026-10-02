import { createFileRoute } from '@tanstack/react-router'
import { isAdminMiddleware } from '@/middlewares/isAdmin'
import {
  adminProvidersQuery,
  adminSummaryQuery,
  adminUsersQuery,
} from './-admin-queries'
import { AdminDashboardPage } from './-components/-admin-page'
import { AdminPageSkeleton } from './-components/admin-page-skeleton'
import { parseAdminTab } from './-components/admin-tabs'
import type { AdminTab } from './-components/admin-tabs'

type AdminSearch = {
  /** Open tab; omitted means "overview". */
  tab?: AdminTab
}

export const Route = createFileRoute('/_app/admin/')({
  server: {
    middleware: [isAdminMiddleware],
  },
  validateSearch: (search: Record<string, unknown>): AdminSearch => ({
    tab: parseAdminTab(search.tab),
  }),
  // Prefetch into the query cache; the page reads it back with suspense
  // queries, so it renders complete on the first paint (SSR and client).
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(adminSummaryQuery()),
      queryClient.ensureQueryData(adminProvidersQuery()),
      queryClient.ensureQueryData(adminUsersQuery()),
    ])
  },
  pendingComponent: AdminPageSkeleton,
  component: AdminDashboardPage,
})
