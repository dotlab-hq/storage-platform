'use client'

import { createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { useTinySession } from '@/hooks/use-tiny-session'
import { WebRTCProvider } from '@/hooks/use-webrtc'
import { WebRTCPage } from './-components/webrtc-page'

export const Route = createFileRoute( '/_app/webrtc/' )( {
    component: WebRTCRoute,
} )

function WebRTCRoute() {
    const tinySession = useTinySession()

    return (
        <WebRTCProvider
            sessionToken={
                tinySession.hasSession ? tinySession.token : null
            }
        >
            <SidebarProvider>
                <AppSidebar />
                <WebRTCPage />
            </SidebarProvider>
        </WebRTCProvider>
    )
}
