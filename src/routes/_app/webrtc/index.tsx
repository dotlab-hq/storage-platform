'use client'

import { createFileRoute } from '@tanstack/react-router'
import { WebRTCPage } from './-components/webrtc-page'

export const Route = createFileRoute('/_app/webrtc/')({
  component: WebRTCRoute,
})

function WebRTCRoute() {
  return <WebRTCPage />
}
