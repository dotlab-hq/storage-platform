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
        title: 'DOT. Storage — Secure Cloud Storage',
      },
      {
        name: 'description',
        content: 'Secure, fast, and simple cloud file storage with end-to-end encryption. Store, share, and manage files safely in the cloud.',
      },
      {
        name: 'keywords',
        content: 'cloud storage, secure file storage, encrypted storage, file sharing, document management, backup, online storage',
      },
      {
        name: 'author',
        content: 'DOT. Storage',
      },
      {
        name: 'robots',
        content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: 'DOT. Storage — Secure Cloud Storage',
      },
      {
        property: 'og:description',
        content: 'Secure, fast, and simple cloud file storage with end-to-end encryption.',
      },
      {
        property: 'og:image',
        content: '/logo.svg',
      },
      {
        property: 'og:url',
        content: 'https://dot-storage.com',
      },
      {
        property: 'og:site_name',
        content: 'DOT. Storage',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'DOT. Storage — Secure Cloud Storage',
      },
      {
        name: 'twitter:description',
        content: 'Secure, fast, and simple cloud file storage with end-to-end encryption.',
      },
      {
        name: 'twitter:image',
        content: '/logo.svg',
      },
      {
        name: 'theme-color',
        content: '#6229ff',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'DOT. Storage',
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
        href: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        rel: 'icon',
        href: '/logo.svg',
        type: 'image/svg+xml',
        sizes: 'any',
      },
      {
        rel: 'apple-touch-icon',
        href: '/logo.svg',
      },
      {
        rel: 'canonical',
        href: 'https://dot-storage.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify( {
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'DOT. Storage',
              description: 'Secure, fast, and simple cloud file storage with end-to-end encryption',
              url: 'https://dot-storage.com',
              applicationCategory: 'BusinessApplication',
              offers: {
                '@type': 'Offer',
                price: '0',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '1000',
              },
              author: {
                '@type': 'Organization',
                name: 'DOT. Storage',
                logo: 'https://dot-storage.com/logo.svg',
              },
            } ),
          }}
        />
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
