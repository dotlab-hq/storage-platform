import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { getChatRouteSnapshotFn } from './-chat-loader-server'
import { ChatRouteSkeleton } from './-chat-loading-skeletons'

const ChatPage = lazy( () =>
  import( './-chat-page' ).then( ( module ) => ( {
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
    <ClientOnly fallback={<ChatRouteSkeleton />}>
      <Suspense fallback={<ChatRouteSkeleton />}>
        <ChatPage initial={initial} />
      </Suspense>
    </ClientOnly>
  )
}
