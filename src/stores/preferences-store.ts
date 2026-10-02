import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * Per-browser user preferences, persisted to localStorage.
 *
 * `skipHydration` keeps the first client render identical to the server
 * render (defaults); `AppLayout` calls `rehydrate()` after mount.
 */
type PreferencesState = {
  /** Receive peer-to-peer (WebRTC) transfers from other devices. */
  webrtcEnabled: boolean
  setWebrtcEnabled: (enabled: boolean) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      webrtcEnabled: false,
      setWebrtcEnabled: (enabled) => set({ webrtcEnabled: enabled }),
    }),
    {
      name: 'dot-preferences',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ webrtcEnabled: state.webrtcEnabled }),
    },
  ),
)
