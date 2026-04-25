import { createFileRoute } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-start'
'use client'

import { lazy, Suspense } from 'react'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { PageSkeleton } from '@/components/ui/page-skeleton'

const WebRTCPage = lazy(() =>
  import('./-components/webrtc-page').then((m) => ({
    default: m.WebRTCPage,
  })),
)

export const Route = createFileRoute('/_app/webrtc/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  component: WebRTCRoute,
})

function WebRTCRoute() {
  return (
    <Suspense fallback={<PageSkeleton className="h-full w-full" />}>
      <WebRTCPage />
    </Suspense>
  )
}
