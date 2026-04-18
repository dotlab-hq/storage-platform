import { createFileRoute } from '@tanstack/react-router'
import { POST as streamPost } from './stream'

export const Route = createFileRoute( '/api/chat/completions' )( {
  server: {
    handlers: {
      POST: POST,
    },
  },
} )

export async function POST( { request }: { request: Request } ) {
  return streamPost( { request } )
}
