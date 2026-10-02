import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router'
import { ThemeProvider } from 'next-themes'

import AppProviders from '../integrations/tanstack-query/root-provider'
import { createRootHead } from '../lib/create-root-head'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { AppErrorBoundary } from '@/components/error-boundary'
import { NotFoundPage } from '@/components/not-found'
import { GlobalShellActions } from '@/components/shell/global-shell-actions'

export interface AppRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
  errorComponent: AppErrorBoundary,
  notFoundComponent: NotFoundPage,
  head: () => createRootHead(appCss),
  shellComponent: RootDocument,
})

/**
 * The HTML document. It renders the same tree on the server and the client
 * (no `window.location` checks, no <ClientOnly> swaps), which is what keeps
 * hydration from re-mounting the page and flashing.
 */
function RootDocument({ children }: { children: React.ReactNode }) {
  const isLanding = useRouterState({
    select: (state) => state.location.pathname.startsWith('/landing'),
  })

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          forcedTheme={isLanding ? 'light' : undefined}
          disableTransitionOnChange
        >
          <AppProviders>
            <TooltipProvider>
              {isLanding ? (
                <div className="min-h-screen bg-white text-slate-900">
                  {children}
                </div>
              ) : (
                <GlobalShellActions>{children}</GlobalShellActions>
              )}
            </TooltipProvider>
            <Toaster />
          </AppProviders>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
