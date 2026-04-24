'use client'

import * as React from 'react'
import { useLocation } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import { WebRTCProvider } from '@/hooks/use-webrtc'
import { useTinySession } from '@/hooks/use-tiny-session'
import { useQuota } from '@/hooks/use-quota'
import { ShaderBackdrop } from '@/components/background/shader-backdrop'
import { lazy, Suspense } from 'react'
import { PageSkeleton } from '@/components/ui/page-skeleton'

const AppSidebar = lazy(() =>
  import('@/components/app-sidebar').then((m) => ({
    default: m.AppSidebar,
  })),
)
const Dock = lazy(() =>
  import('@/components/ui/dock').then((m) => ({
    default: m.Dock,
  })),
)

export type RootLayoutProps = {
  children: React.ReactNode
}

const noDockRoutes = ['/chat']

function shouldHideDock(pathname: string): boolean {
  return noDockRoutes.some((route) => pathname.startsWith(route))
}

/**
 * RootLayout wraps the entire app with WebRTC and Sidebar providers.
 * Automatically loads storage quota for display in the sidebar.
 * Pass children as SidebarInset with your page content.
 * Modals and overlays should be rendered after this component.
 */
export function RootLayout({ children }: RootLayoutProps) {
  const tinySession = useTinySession()
  const quota = useQuota()
  const location = useLocation()
  const hideDock = shouldHideDock(location.pathname)

  return (
    <WebRTCProvider
      sessionToken={tinySession.hasSession ? tinySession.token : null}
    >
      <div className="min-h-screen">
        <ShaderBackdrop />
        <SidebarProvider>
          <Suspense fallback={null}>
            <AppSidebar quota={quota} />
          </Suspense>
          <div className="flex-1 flex flex-col min-h-[100dvh]">
            {children}
            {!hideDock && (
              <Suspense fallback={null}>
                <Dock />
              </Suspense>
            )}
          </div>
        </SidebarProvider>
      </div>
    </WebRTCProvider>
  )
}
