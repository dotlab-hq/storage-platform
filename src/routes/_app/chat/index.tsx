import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { createClientOnlyFn } from '@tanstack/react-start'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { getChatRouteSnapshotFn } from './-chat-loader-server'
import type { ChatRouteSnapshot } from './-chat-types'

type ChatPageModule = {
  ChatPage: ( props: { initial: ChatRouteSnapshot } ) => JSX.Element
}

const loadChatPage = createClientOnlyFn( async () => {
  const module = await import( './-chat-page' ) as ChatPageModule
  return module.ChatPage
} )

export const Route = createFileRoute( '/_app/chat/' )( {
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  loader: () => getChatRouteSnapshotFn(),
  component: ChatRoutePage,
} )

function ChatRoutePage() {
  const initial = Route.useLoaderData()
  const [ChatPageComponent, setChatPageComponent] = useState<
    ( ( props: { initial: ChatRouteSnapshot } ) => JSX.Element ) | null
  >( null )

  useEffect( () => {
    let isMounted = true

    void loadChatPage().then( ( component ) => {
      if ( !isMounted ) {
        return
      }
      setChatPageComponent( () => component )
    } )

    return () => {
      isMounted = false
    }
  }, [] )

  if ( !ChatPageComponent ) {
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center text-sm text-muted-foreground">
        Loading chat...
      </div>
    )
  }

  return (
    <ChatPageComponent initial={initial} />
  )
}
