'use client'

import * as React from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { WebRTCProvider } from '@/hooks/use-webrtc'
import { useTinySession } from '@/hooks/use-tiny-session'
import { useQuota } from '@/hooks/use-quota'
import { AppSidebar } from '@/components/app-sidebar'
import { ShaderBackdrop } from '@/components/background/shader-backdrop'
import { Dock } from '@/components/ui/dock'

export type RootLayoutProps = {
  children: React.ReactNode
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

  return (
    <WebRTCProvider
      sessionToken={tinySession.hasSession ? tinySession.token : null}
    >
      <div className="min-h-screen">
        <ShaderBackdrop />
        <SidebarProvider>
          <AppSidebar quota={quota} />
          <div className="flex-1 flex flex-col min-h-[100dvh]">
            {children}
            <Dock />
          </div>
        </SidebarProvider>
      </div>
    </WebRTCProvider>
  )
}
