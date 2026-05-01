import type { BaseMessage } from '@langchain/core/messages'
import { parseToolCallChunks } from '@/routes/api/v1/-converters'
import { countTokens, extractUsageFromChunk } from '@/lib/token-counter'
import type { Usage } from '@/lib/token-counter'
import type { StructuredTool } from '@langchain/core/tools'
import type { EnhancedTool } from '@/routes/_app/chat/tools/-tool-types'
import { normalizeOpenAiContent } from '@/utils/normalize-openai-message'

/**
 * Stream chunk emitted to client
 */
export interface StreamChunk {
  type: 'content' | 'reasoning' | 'final' | 'error'
  content?: string
  reasoning?: string
  toolCalls?: Array<{
    id: string
    type: 'function'
    function: {
      name: string
      arguments: string
    }
  }>
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter'
  usage?: Usage
  error?: string
}

/**
 * LLM streaming parameters
 */
export interface LLMStreamParams {
  temperature?: number
  topP?: number
  maxOutputTokens?: number
  stopSequences?: string[]
  seed?: number
  tools?: Array<StructuredTool | EnhancedTool>
  toolChoice?:
  | 'auto'
  | 'none'
  | 'required'
  | { type: 'function'; function: { name: string } }
  responseFormat?: { type: 'text' | 'json_object' }
  streamDelayMs?: number
}

/**
 * Stream assistant replies with full OpenAI parameter support and tool calling
 */
export async function* generateAssistantReplyStream(
  messages: BaseMessage[],
  params: LLMStreamParams = {},
  signal?: AbortSignal,
): AsyncGenerator<StreamChunk, void, unknown> {
  const {
    temperature = 1,
    topP = 1,
    maxOutputTokens = 8192,
    stopSequences,
    tools,
    toolChoice = 'auto',
    responseFormat,
    streamDelayMs = 0,
  } = params

  const { llm } = await import( '@/llm/gemini.llm' )

  // Bind tools using LangChain's bindTools for proper schema conversion
  let streamingLLM: { stream: typeof llm.stream } = llm
  if ( tools && tools.length > 0 ) {
    streamingLLM = llm.bindTools( tools, { tool_choice: toolChoice } )
    console.log(
      '[LLM] Bound tools:',
      tools.map( ( t ) => t.name ),
      'toolChoice:',
      toolChoice,
    )
  } else {
    console.log( '[LLM] No tools provided' )
  }

  // Build generation config
  const generationConfig: Record<string, unknown> = {
    temperature,
    topP,
    maxOutputTokens,
    ...( stopSequences && stopSequences.length > 0 && { stopSequences } ),
    ...( responseFormat?.type === 'json_object' && {
      responseMimeType: 'application/json',
    } ),
  }

  // Start streaming
  const stream = await streamingLLM.stream( messages, {
    ...generationConfig,
    signal,
  } )

  // Accumulate content and raw tool call chunks across stream chunks
  let fullContent = ''
  const allToolCallChunks: Array<{
    index: number
    id?: string
    name?: string
    args?: string
  }> = []
  let directToolCalls: Array<{
    id: string
    type: 'function'
    function: { name: string; arguments: string }
  }> = []
  let finalUsage: Usage | null = null

  try {
    for await ( const chunk of stream ) {
      if ( signal?.aborted ) {
        return
      }

      // Extract usage if present in chunk
      const chunkUsage = extractUsageFromChunk( chunk )
      if ( chunkUsage ) {
        finalUsage = chunkUsage
      }

      const chunkRecord =
        chunk && typeof chunk === 'object'
          ? ( chunk as unknown as Record<string, unknown> )
          : {}
      const rawContent = chunkRecord.contentBlocks ?? chunkRecord.content
      const normalizedContent = normalizeOpenAiContent( rawContent )

      if ( normalizedContent.reasoning ) {
        if ( streamDelayMs > 0 ) {
          for await ( const char of streamWithCadence(
            normalizedContent.reasoning,
            signal,
            streamDelayMs,
          ) ) {
            yield { type: 'reasoning', reasoning: char }
          }
        } else {
          yield { type: 'reasoning', reasoning: normalizedContent.reasoning }
        }
      }

      if ( normalizedContent.text ) {
        fullContent += normalizedContent.text
        if ( streamDelayMs > 0 ) {
          for await ( const char of streamWithCadence(
            normalizedContent.text,
            signal,
            streamDelayMs,
          ) ) {
            yield { type: 'content', content: char }
          }
        } else {
          yield { type: 'content', content: normalizedContent.text }
        }
      }

      // Accumulate tool calls from provider-specific chunk shapes
      const toolChunks = extractToolCallChunksFromChunk( chunk )
      if ( toolChunks.length > 0 ) {
        console.log( '[LLM] Received toolCallChunks:', toolChunks )
        allToolCallChunks.push( ...toolChunks )
      }

      const normalizedDirectToolCalls = extractDirectToolCallsFromChunk( chunk )
      if ( normalizedDirectToolCalls.length > 0 ) {
        directToolCalls = normalizedDirectToolCalls
        console.log( '[LLM] Received direct toolCalls:', directToolCalls )
      }
    }

    // After streaming all chunks, determine final tool calls
    let accumulatedToolCalls: Array<{
      id: string
      type: 'function'
      function: { name: string; arguments: string }
    }> = []

    if ( allToolCallChunks.length > 0 ) {
      accumulatedToolCalls = parseToolCallChunks( allToolCallChunks )
      console.log( '[LLM] Final tool calls (from chunks):', accumulatedToolCalls )
    } else if ( directToolCalls.length > 0 ) {
      accumulatedToolCalls = directToolCalls
      console.log( '[LLM] Final tool calls (direct):', accumulatedToolCalls )
    }

    // Determine finish reason
    const finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' =
      accumulatedToolCalls.length > 0 ? 'tool_calls' : 'stop'

    // Compute usage if not provided by the model
    let computedUsage: Usage | undefined
    if ( !finalUsage && fullContent ) {
      const messagesText = messages
        .map(
          ( msg ) =>
            `${msg.getType()}: ${normalizeOpenAiContent( msg.content ).text}`,
        )
        .join( '\n\n' )
      const promptTokens = countTokens( messagesText )
      const completionTokens = countTokens( fullContent )
      computedUsage = {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
      }
    }

    // Yield final chunk
    yield {
      type: 'final',
      content: fullContent,
      toolCalls: accumulatedToolCalls,
      finishReason,
      usage: finalUsage || computedUsage,
    }
  } catch ( error ) {
    const err = error instanceof Error ? error : new Error( String( error ) )
    console.error( '[LLM Stream] Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    } )

    const errorMessage = err.message.toLowerCase()
    if (
      errorMessage.includes( 'api key' ) ||
      errorMessage.includes( 'authentication' ) ||
      errorMessage.includes( 'unauthorized' )
    ) {
      throw new Error(
        'Invalid or missing API key for language model. Please check your Google AI API key configuration.',
      )
    } else if (
      errorMessage.includes( 'quota' ) ||
      errorMessage.includes( 'rate limit' )
    ) {
      throw new Error(
        'Language model API quota exceeded or rate limited. Please try again later.',
      )
    } else if (
      errorMessage.includes( 'model' ) &&
      errorMessage.includes( 'not found' )
    ) {
      throw new Error(
        'Requested language model is not available. Please check model configuration.',
      )
    } else if ( errorMessage.includes( 'internal' ) ) {
      throw new Error(
        'Language model service encountered an internal error. Please try again.',
      )
    } else {
      throw err
    }
  }
}

/**
 * Stream text with artificial delay for smooth UX
 */
async function* streamWithCadence(
  text: string,
  signal?: AbortSignal,
  delayMs: number = 0,
): AsyncGenerator<string, void, unknown> {
  if ( delayMs <= 0 ) {
    yield text
    return
  }

  for ( const character of text ) {
    if ( signal?.aborted ) {
      return
    }
    yield character
    await new Promise<void>( ( resolve ) => {
      setTimeout( resolve, delayMs )
    } )
  }
}

type RawToolCallChunk = {
  index: number
  id?: string
  name?: string
  args?: string
}

type RawDirectToolCall = {
  id?: string
  name?: string
  args?: unknown
  type?: string
  function?: {
    name?: string
    arguments?: unknown
  }
}

function extractToolCallChunksFromChunk( chunk: unknown ): RawToolCallChunk[] {
  if ( !chunk || typeof chunk !== 'object' ) {
    return []
  }

  const chunkRecord = chunk as Record<string, unknown>
  const direct = chunkRecord.toolCallChunks
  if ( Array.isArray( direct ) ) {
    return direct.filter( isRawToolCallChunk )
  }

  const snake = chunkRecord.tool_call_chunks
  if ( Array.isArray( snake ) ) {
    return snake.filter( isRawToolCallChunk )
  }

  const additional = chunkRecord.additional_kwargs
  if ( additional && typeof additional === 'object' ) {
    const additionalRecord = additional as Record<string, unknown>
    const nestedChunks = additionalRecord.tool_call_chunks
    if ( Array.isArray( nestedChunks ) ) {
      return nestedChunks.filter( isRawToolCallChunk )
    }
  }

  return []
}

function extractDirectToolCallsFromChunk( chunk: unknown ): Array<{
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}> {
  if ( !chunk || typeof chunk !== 'object' ) {
    return []
  }

  const chunkRecord = chunk as Record<string, unknown>
  const candidates: unknown[] = []

  candidates.push( chunkRecord.toolCalls )
  candidates.push( chunkRecord.tool_calls )

  const additional = chunkRecord.additional_kwargs
  if ( additional && typeof additional === 'object' ) {
    const additionalRecord = additional as Record<string, unknown>
    candidates.push( additionalRecord.tool_calls )
  }

  for ( const candidate of candidates ) {
    if ( !Array.isArray( candidate ) ) {
      continue
    }

    const normalized = candidate
      .filter( isRawDirectToolCall )
      .map( normalizeDirectToolCall )
      .filter(
        (
          toolCall,
        ): toolCall is {
          id: string
          type: 'function'
          function: { name: string; arguments: string }
        } => toolCall !== null,
      )

    if ( normalized.length > 0 ) {
      return normalized
    }
  }

  return []
}

function isRawToolCallChunk( value: unknown ): value is RawToolCallChunk {
  if ( !value || typeof value !== 'object' ) {
    return false
  }
  const record = value as Record<string, unknown>
  return typeof record.index === 'number'
}

function isRawDirectToolCall( value: unknown ): value is RawDirectToolCall {
  return !!value && typeof value === 'object'
}

function normalizeDirectToolCall( value: RawDirectToolCall ): {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
} | null {
  const functionName = value.function?.name ?? value.name
  if ( !functionName ) {
    return null
  }

  const rawArgs = value.function?.arguments ?? value.args
  const args =
    typeof rawArgs === 'string'
      ? rawArgs
      : JSON.stringify( rawArgs ?? {}, null, 0 )

  return {
    id: value.id ?? `call_${Math.random().toString( 36 ).slice( 2, 10 )}`,
    type: 'function',
    function: {
      name: functionName,
      arguments: args,
    },
  }
}
