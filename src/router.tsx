import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'

import { createQueryClient } from './integrations/tanstack-query/root-provider'
import { NotFoundPage } from '@/components/not-found'

export function getRouter() {
  // A fresh QueryClient per router => per request on the server.
  const queryClient = createQueryClient()

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },

    scrollRestoration: true,
    // Hovering a link preloads the next page's loader (and therefore its
    // queries), so navigation renders instantly instead of showing skeletons.
    defaultPreload: 'intent',
    // Let TanStack Query decide freshness; the router should not refetch
    // loader data that the query cache already holds.
    defaultPreloadStaleTime: 0,
    // Only show a pending skeleton when a navigation is actually slow, and
    // keep it up long enough to not blink.
    defaultPendingMs: 300,
    defaultPendingMinMs: 300,
    defaultNotFoundComponent: NotFoundPage,
  })

  // Dehydrates queries fetched during SSR and hydrates them on the client,
  // and wraps the app in <QueryClientProvider>.
  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
