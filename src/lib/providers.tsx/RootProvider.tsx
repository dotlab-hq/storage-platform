'use client'

import * as React from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { WebRTCProvider } from '@/hooks/use-webrtc'
import { useTinySession } from '@/hooks/use-tiny-session'
import { AppSidebar } from '@/components/app-sidebar'
import type { UserQuota } from '@/types/storage'

export type RootLayoutProps = {
    children: React.ReactNode
    quota?: UserQuota | null
}

/**
 * RootLayout wraps the entire app with WebRTC and Sidebar providers.
 * Pass children as SidebarInset with your page content.
 * Modals and overlays should be rendered after this component.
 */
export function RootLayout( { children, quota = null }: RootLayoutProps ) {
    const tinySession = useTinySession()

    return (
        <WebRTCProvider sessionToken={tinySession.hasSession ? tinySession.token : null}>
            <div className="min-h-screen">
                <SidebarProvider>
                    <AppSidebar quota={quota} />
                    {children}
                </SidebarProvider>
            </div>
        </WebRTCProvider>
    )
}


