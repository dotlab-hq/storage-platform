import { createFileRoute, ClientOnly } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { getChatRouteSnapshotFn } from './-components/-chat-loader-server'
import { ChatRouteSkeleton } from './-components/-chat-loading-skeletons'

const ChatPage = lazy( () =>
  import( './-components/-chat-page' ).then( ( module ) => ( {
    default: module.ChatPage,
  } ) ),
)

export const Route = createFileRoute( '/_app/chat/' )( {
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  loader: () => getChatRouteSnapshotFn(),
  component: ChatRoutePage,
} )

function ChatRoutePage() {
  const initial = Route.useLoaderData()
  return (
    <Suspense fallback={<ChatRouteSkeleton />}>
      <ClientOnly fallback={<ChatRouteSkeleton />}>
        <ChatPage initial={initial} />
      </ClientOnly>
    </Suspense>
  )
}
