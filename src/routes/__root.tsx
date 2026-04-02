import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from 'next-themes'

import TanStackQueryProvider from '../integrations/tanstack-query/root-provider'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { AppErrorBoundary } from '@/components/error-boundary'
import { NotFoundPage } from '@/components/not-found'

interface MyRouterContext {
  queryClient: QueryClient
}

const Devtools = import.meta.env.DEV
  ? lazy( () =>
    import( '@/components/devtools/tanstack-devtools' ).then( ( module ) => ( {
      default: module.TanstackDevtools,
    } ) )
  )
  : null

const GlobalShellActions = lazy( () =>
  import( '@/components/shell/global-shell-actions' ).then( ( module ) => ( {
    default: module.GlobalShellActions,
  } ) )
)

export const Route = createRootRouteWithContext<MyRouterContext>()( {
  errorComponent: AppErrorBoundary,
  notFoundComponent: NotFoundPage,
  head: () => ( {
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'DOT. Storage',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
    ],
  } ),
  shellComponent: RootDocument,
} )

function RootDocument( { children }: { children: React.ReactNode } ) {
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
              <Suspense fallback={children}>
                <GlobalShellActions>{children}</GlobalShellActions>
              </Suspense>
            </TooltipProvider>
            <Toaster />
            {Devtools ? (
              <Suspense fallback={null}>
                <Devtools />
              </Suspense>
            ) : null}
          </TanStackQueryProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
