'use client'

import * as React from 'react'
import { useLocation } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import { WebRTCProvider } from '@/hooks/use-webrtc'
import { useTinySession } from '@/hooks/use-tiny-session'
import { useQuota } from '@/hooks/use-quota'
import { ShaderBackdrop } from '@/components/background/shader-backdrop'
import { lazy, Suspense } from 'react'
import { useFileSelectionUiStore } from '@/lib/stores/file-selection-ui-store'
import { ProfilerBoundary } from '@/components/app/profiler-boundary'
import { Activity } from '@/components/ui/activity'

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
const UploadWidget = lazy(() =>
  import('@/components/storage/upload-widget').then((m) => ({
    default: m.UploadWidget,
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
  const hasSelectedFiles = useFileSelectionUiStore(
    (state) => state.hasSelectedFiles,
  )
  const hideDock = shouldHideDock(location.pathname) || hasSelectedFiles

  return (
    <WebRTCProvider
      sessionToken={tinySession.hasSession ? tinySession.token : null}
    >
      <div className="min-h-screen">
        <ShaderBackdrop />
        <SidebarProvider>
          <ProfilerBoundary id="app-sidebar">
            <Suspense fallback={null}>
              <AppSidebar quota={quota} />
            </Suspense>
          </ProfilerBoundary>
          <div className="flex-1 flex flex-col min-h-[100dvh]">
            <ProfilerBoundary id="app-content">{children}</ProfilerBoundary>
            <Activity when={!hideDock}>
              <Suspense fallback={null}>
                <Dock />
              </Suspense>
            </Activity>
          </div>
          <ProfilerBoundary id="upload-widget">
            <Suspense fallback={null}>
              <UploadWidget />
            </Suspense>
          </ProfilerBoundary>
        </SidebarProvider>
      </div>
    </WebRTCProvider>
  )
}
