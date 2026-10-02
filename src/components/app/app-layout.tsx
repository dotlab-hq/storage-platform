import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import { WebRTCProvider } from '@/hooks/use-webrtc'
import { useTinySession } from '@/hooks/use-tiny-session'
import { ShaderBackdrop } from '@/components/background/shader-backdrop'
import { AppSidebar } from '@/components/app-sidebar'
import { Dock } from '@/components/ui/dock'
import { UploadWidget } from '@/components/storage/upload-widget'
import { useHasSelection, useSelectionStore } from '@/stores/selection-store'
import { usePreferencesStore } from '@/stores/preferences-store'

/**
 * Chrome shared by every signed-in page: sidebar, bottom dock and the
 * floating upload widget. Everything here is imported eagerly so the shell is
 * fully painted on the first render (no pop-in / layout shift).
 */
export function AppLayout({ children }: { children: ReactNode }) {
  const tinySession = useTinySession()
  const hasSelection = useHasSelection()
  usePreferencesHydration()
  useClearSelectionOnPageChange()

  return (
    <WebRTCProvider
      sessionToken={tinySession.hasSession ? tinySession.token : null}
    >
      <div className="min-h-screen">
        <ShaderBackdrop />
        <SidebarProvider>
          <AppSidebar />
          <div className="relative flex min-h-dvh flex-1 flex-col">
            {children}
            {/* The selection action bar takes the dock's place. */}
            {!hasSelection && <Dock />}
          </div>
          <UploadWidget />
        </SidebarProvider>
      </div>
    </WebRTCProvider>
  )
}

/** Loads persisted preferences after the first (hydration-safe) render. */
function usePreferencesHydration() {
  useEffect(() => {
    void usePreferencesStore.persist.rehydrate()
  }, [])
}

/** A selection belongs to one page/folder; drop it when the URL changes. */
function useClearSelectionOnPageChange() {
  const href = useRouterState({ select: (state) => state.location.href })
  useEffect(() => {
    useSelectionStore.getState().clear()
  }, [href])
}
