import {
  ClientOnly,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from 'next-themes'

import TanStackQueryProvider from '../integrations/tanstack-query/root-provider'
import { ServiceWorkerRegistration } from '@/components/pwa/service-worker-registration'
import { createRootHead } from './root-head'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { AppErrorBoundary } from '@/components/error-boundary'
import { NotFoundPage } from '@/components/not-found'
import { GlobalShellActions } from '@/components/shell/global-shell-actions'

interface MyRouterContext {
  queryClient: QueryClient
}

// const Devtools = import.meta.env.DEV
//   ? lazy(() =>
//       import('@/components/devtools/tanstack-devtools').then((module) => ({
//         default: module.TanstackDevtools,
//       })),
//     )
//   : null

export const Route = createRootRouteWithContext<MyRouterContext>()({
  errorComponent: AppErrorBoundary,
  notFoundComponent: NotFoundPage,
  
  head: () => createRootHead(appCss),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
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
          disableTransitionOnChange={false}
        >
          <TanStackQueryProvider>
            <TooltipProvider>
              <ClientOnly fallback={children}>
                <Suspense fallback={children}>
                  <GlobalShellActions>{children}</GlobalShellActions>
                </Suspense>
              </ClientOnly>
            </TooltipProvider>
            <Toaster />
            {/* {Devtools ? (
              <Suspense
                fallback={
                  <PageSkeleton variant="compact" className="mx-3 my-2" />
                }
              >
                <Devtools />
              </Suspense>
            ) : null} */}
            <ServiceWorkerRegistration />
          </TanStackQueryProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
