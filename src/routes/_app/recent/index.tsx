import { createFileRoute } from '@tanstack/react-router'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { recentItemsQuery } from './-components/recent-query'
import { RecentPage } from './-components/recent-page'
import { RecentPageSkeleton } from './-components/recent-page-skeleton'

export const Route = createFileRoute('/_app/recent/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(recentItemsQuery()),
  pendingComponent: RecentPageSkeleton,
  component: RecentPage,
})
