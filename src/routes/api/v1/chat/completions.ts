
import { getAuthenticatedUser } from '@/lib/server-auth'
import { db } from '@/db'
import { chatMessage, chatThread } from '@/db/schema/chat'
import { and, eq } from 'drizzle-orm'
import { openAIMessagesToLangChain } from '@/routes/_app/chat/-converters'
import {
  getToolsByName,
  getAllTools,
} from '@/routes/_app/chat/tools/-tool-registry'
import { OpenAIChatCompletionsSchema } from '../-schemas'
import type { LLMStreamParams } from '@/routes/_app/chat/-chat-llm-streamer'
import { handleStreamingResponse } from './-streaming-handler'
import { handleNonStreamingResponse } from './-non-streaming-handler'
import { handleDeepAgentStream } from './-deep-agent-stream-handler'
import { getUserFromApiKey } from './-auth-helpers'
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute( '/api/v1/chat/completions' )( {
  server: {
    handlers: {
      POST: POST,
      OPTIONS: OPTIONS,
    },
  },
} )

export async function OPTIONS() {
  return json( null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
    status: 204,
  } )
}

export async function POST( { request }: { request: Request } ) {
  try {
    // Check for required API keys early
    const googleApiKey = process.env.GOOGLE_API_KEY
    if ( !googleApiKey ) {
      console.error( '[Chat] Missing GOOGLE_API_KEY environment variable' )
      return json(
        {
          error: {
            message:
              'Language model service is not configured. Please set GOOGLE_API_KEY environment variable.',
            type: 'configuration_error',
            code: 'missing_api_key',
          },
        },
        { status: 500 },
      )
    }

    const body: unknown = await request.json()
    const bodyRecord =
      typeof body === 'object' && body !== null
        ? ( body as Record<string, unknown> )
        : null
    const bodyTools = bodyRecord?.tools
    console.log(
      '[Chat] Full body (first 500 chars):',
      JSON.stringify( body ).slice( 0, 500 ),
    )
    console.log(
      '[Chat] body.tools is:',
      typeof bodyTools,
      Array.isArray( bodyTools ) ? 'array[' + bodyTools.length + ']' : bodyTools,
    )
    const validated = OpenAIChatCompletionsSchema.parse( body )
    console.log(
      '[Chat] Parsed validated.tools:',
      validated.tools?.map( ( t ) => t.function.name ),
    )

    // Authentication (session OR API key)
    const currentUser = await getAuthenticatedUser().catch( () => null )
    const apiKeyUser = await getUserFromApiKey( request.headers ).catch(
      () => null,
    )

    if ( !currentUser && !apiKeyUser ) {
      return json(
        {
          error: {
            message: 'Unauthorized - provide valid session or API key',
            type: 'authentication_error',
            code: 'missing_auth',
          },
        },
        { status: 401 },
      )
    }

    const user = currentUser ?? apiKeyUser!

    // Determine threadId
    let threadId: string
    const inputThreadId = validated.thread_id || validated.threadId
    if ( inputThreadId ) {
      const existing = await db
        .select( { id: chatThread.id } )
        .from( chatThread )
        .where(
          and(
            eq( chatThread.id, inputThreadId ),
            eq( chatThread.userId, user.id ),
            eq( chatThread.isDeleted, false ),
          ),
        )
        .limit( 1 )

      if ( existing.length === 0 ) {
        return json(
          {
            error: {
              message: 'Thread not found.',
              type: 'invalid_request_error',
              code: 'thread_not_found',
            },
          },
          { status: 404 },
        )
      }
      threadId = inputThreadId
    } else {
      const now = new Date()
      const [newThread] = await db
        .insert( chatThread )
        .values( {
          userId: user.id,
          title: 'New Chat',
          latestPreview: null,
          lastMessageAt: now,
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
        } )
        .returning( { id: chatThread.id } )
      threadId = newThread.id
    }

    // Convert messages to LangChain format
    const langchainMessages = openAIMessagesToLangChain( validated.messages )

    // Insert user message
    const userMessageContent =
      validated.messages[validated.messages.length - 1].content
    const now = new Date()
    const [userMessage] = await db
      .insert( chatMessage )
      .values( {
        threadId,
        userId: user.id,
        role: 'user',
        content:
          typeof userMessageContent === 'string'
            ? userMessageContent
            : JSON.stringify( userMessageContent ),
        regenerationCount: 0,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      } )
      .returning( { id: chatMessage.id } )

    // Determine tools - always include default tools if none specified
    const requestedToolNames =
      validated.tools?.map( ( t ) => t.function.name ) || []
    let availableTools = getToolsByName( requestedToolNames )

    // If no tools explicitly requested, provide all available tools by default
    if ( requestedToolNames.length === 0 ) {
      availableTools = getAllTools()
      console.log( '[Chat] No tools requested, enabling all available tools' )
    }

    console.log(
      '[Chat] Requested tools:',
      requestedToolNames,
      '| Resolved:',
      availableTools.map( ( t ) => t.name ),
    )

    const stopSequences =
      typeof validated.stop === 'string'
        ? [validated.stop]
        : Array.isArray( validated.stop )
          ? validated.stop
          : undefined

    // Prepare LLM parameters
    const llmParams: LLMStreamParams = {
      temperature: validated.temperature,
      topP: validated.top_p,
      maxOutputTokens: validated.max_tokens,
      stopSequences,
      seed: validated.seed,
      tools: availableTools,
      toolChoice: validated.tool_choice,
      responseFormat: validated.response_format,
      streamDelayMs: 0,
    }

    // Check for DeepAgent mode via custom header or parameter
    const useDeepAgent =
      request.headers.get( 'X-Use-Deep-Agent' ) === 'true' ||
      bodyRecord?.deep_agent === true

    // Route to appropriate handler
    if ( validated.stream ) {
      if ( useDeepAgent ) {
        return handleDeepAgentStream( {
          messages: langchainMessages,
          params: llmParams,
          threadId,
          userId: user.id,
          userMessageId: userMessage.id,
          model: validated.model,
        } )
      } else {
        return handleStreamingResponse( {
          messages: langchainMessages,
          params: llmParams,
          threadId,
          userId: user.id,
          userMessageId: userMessage.id,
          model: validated.model,
        } )
      }
    } else {
      if ( useDeepAgent ) {
        // For now, deep agent only supports streaming
        // Fallback to non-streaming with warning
        console.warn(
          '[DeepAgent] Non-streaming mode not yet implemented, falling back to standard handler',
        )
      }
      return handleNonStreamingResponse( {
        messages: langchainMessages,
        params: llmParams,
        threadId,
        userId: user.id,
        userMessageId: userMessage.id,
        model: validated.model,
      } )
    }
  } catch ( error ) {
    // Enhanced error handling - capture full error details
    const err = error instanceof Error ? error : new Error( String( error ) )

    // Log the complete error with stack for debugging
    console.error( '[OpenAI Chat] Request error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause,
    } )

    // Return detailed error to client (in dev mode, include stack)
    const isDev = process.env.NODE_ENV === 'development'
    return json(
      {
        error: {
          message: err.message,
          type: 'invalid_request_error',
          code: 'server_error',
          ...( isDev && { stack: err.stack, cause: err.cause } ),
        },
      },
      { status: 500 },
    )
  }
}
