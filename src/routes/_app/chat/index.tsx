import { createFileRoute } from '@tanstack/react-router'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { ChatPage } from './-chat-page'
import { getChatRouteSnapshotFn } from './-chat-loader-server'

export const Route = createFileRoute('/_app/chat/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  loader: () => getChatRouteSnapshotFn(),
  component: ChatRoutePage,
})

function ChatRoutePage() {
  const initial = Route.useLoaderData()
  return <ChatPage initial={initial} />
}
