'use client'

import { useEffect } from 'react'

const SERVICE_WORKER_PATH = '/sw'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let cancelled = false

    void navigator.serviceWorker
      .register(SERVICE_WORKER_PATH, { scope: '/' })
      .then((registration) => {
        if (cancelled) return

        registration.onupdatefound = () => {
          const installingWorker = registration.installing
          if (!installingWorker) return

          installingWorker.onstatechange = () => {
            if (installingWorker.state !== 'installed') return
            if (!navigator.serviceWorker.controller) return

            // Avoid forcing skipWaiting + reload automatically. Instead notify
            // the app that an update is available so the UI can prompt the user.
            window.dispatchEvent(
              new CustomEvent('dot:sw-update-available', {
                detail: { registration },
              }),
            )
          }
        }
      })
      .catch((error: unknown) => {
        console.error('ServiceWorker registration failed:', error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return null
}
