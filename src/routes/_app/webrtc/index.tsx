import { createFileRoute } from '@tanstack/react-router'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { WebRTCPage } from './-components/webrtc-page'

export const Route = createFileRoute('/_app/webrtc/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  component: WebRTCPage,
})
