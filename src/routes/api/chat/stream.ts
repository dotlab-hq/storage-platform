import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { handleStreamingResponse } from '@/routes/api/v1/chat/-streaming-handler'

export const Route = createFileRoute( '/api/chat/stream' )( {
  server: {
    handlers: {
      POST,
    },
  },
} )

export async function POST( { request }: { request: Request } ) {
  try {
    // Delegate to the enhanced streaming handler with full tool orchestration
    return await handleStreamingResponse( {
      request,
      // Pass through necessary context
      getDb: () => import( '@/db' ),
      getChatSchema: () => import( '@/db/schema/chat' ),
    } )
  } catch ( error ) {
    console.error( '[Chat Stream] Handler error:', error )
    return json(
      {
        error: {
          message:
            error instanceof Error ? error.message : 'Stream request failed',
          type: 'invalid_request_error',
        },
      },
      { status: 400 },
    )
  }
}
