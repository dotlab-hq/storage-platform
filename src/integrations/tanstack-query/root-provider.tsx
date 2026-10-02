import type { ReactNode } from 'react'
import { HotkeysProvider } from '@tanstack/react-hotkeys'
import { QueryClient } from '@tanstack/react-query'

/**
 * Creates the QueryClient for one router instance.
 *
 * IMPORTANT: this must be called once per request on the server (the router
 * factory does that). A module-level singleton would share cached data
 * between users on the same Worker isolate.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is preloaded by route loaders; avoid immediately refetching it
        // on mount/hydration, which is what made lists flash.
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  })
}

/**
 * App-wide client providers. The QueryClientProvider itself is installed by
 * `setupRouterSsrQueryIntegration` in `src/router.tsx`.
 */
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <HotkeysProvider
      defaultOptions={{
        hotkey: { preventDefault: true },
        hotkeySequence: { timeout: 1500 },
      }}
    >
      {children}
    </HotkeysProvider>
  )
}
