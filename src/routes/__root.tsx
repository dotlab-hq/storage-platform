import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryProvider from '../integrations/tanstack-query/root-provider'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { AppErrorBoundary } from '@/components/error-boundary'
import { NotFoundPage } from '@/components/not-found'

interface MyRouterContext {
  queryClient: QueryClient
}

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
    ],
  } ),
  shellComponent: RootDocument,
} )

function RootDocument( { children }: { children: React.ReactNode } ) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <TanStackQueryProvider>

          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />

          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        </TanStackQueryProvider>
        <Scripts />
      </body>
    </html>
  )
}
