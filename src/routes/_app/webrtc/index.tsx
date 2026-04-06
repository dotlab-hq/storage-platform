'use client'

import { createFileRoute } from '@tanstack/react-router'
import { WebRTCPage } from './-components/webrtc-page'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'

export const Route = createFileRoute('/_app/webrtc/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  component: WebRTCRoute,
})

function WebRTCRoute() {
  return <WebRTCPage />
}
