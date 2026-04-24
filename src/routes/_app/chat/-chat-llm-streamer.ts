import { BaseMessage } from '@langchain/core/messages'
import { parseToolCallChunks } from '@/routes/api/v1/-converters'
import {
  countTokens,
  extractUsageFromChunk,
  type Usage,
} from '@/lib/token-counter'
import type { StructuredTool } from '@langchain/core/tools'

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
  tools?: StructuredTool[]
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

  const { llm } = await import('@/llm/gemini.llm')

  // Build generation config
  const generationConfig: Record<string, unknown> = {
    temperature,
    topP,
    maxOutputTokens,
    ...(stopSequences && stopSequences.length > 0 && { stopSequences }),
    ...(responseFormat?.type === 'json_object' && {
      responseMimeType: 'application/json',
    }),
  }

  // Prepare tools if provided
  const streamOptions: Record<string, unknown> = { signal }
  if (tools && tools.length > 0) {
    streamOptions.tools = tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: (tool as any).schema as any,
      },
    }))
    streamOptions.tool_choice = toolChoice
  }

  const stream = await llm.stream(messages, {
    ...streamOptions,
    ...generationConfig,
  })

  let fullContent = ''
  let accumulatedToolCalls: Array<{
    id: string
    type: 'function'
    function: { name: string; arguments: string }
  }> = []
  let finalUsage: Usage | null = null

  // Process the streaming response
  for await (const chunk of stream) {
    if (signal?.aborted) {
      return
    }

    // Extract usage if present in chunk
    const chunkUsage = extractUsageFromChunk(chunk)
    if (chunkUsage) {
      finalUsage = chunkUsage
    }

    // Check for content blocks (separates reasoning from text when available)
    const chunkObj = chunk as {
      contentBlocks?: Array<{ type: string; text?: string; reasoning?: string }>
    }
    const contentBlocks = chunkObj.contentBlocks

    if (contentBlocks && Array.isArray(contentBlocks)) {
      // Process each block separately to emit reasoning and content in separate chunks
      for (const block of contentBlocks) {
        if (block.type === 'reasoning' && block.reasoning) {
          yield { type: 'reasoning', reasoning: block.reasoning }
        } else if (block.type === 'text' && block.text) {
          fullContent += block.text
          if (streamDelayMs > 0) {
            for await (const char of streamWithCadence(
              block.text,
              signal,
              streamDelayMs,
            )) {
              yield { type: 'content', content: char }
            }
          } else {
            yield { type: 'content', content: block.text }
          }
        }
      }
    } else {
      // Fallback: Extract content from chunk.content (legacy behavior)
      let content: string
      if (!chunk || typeof chunk !== 'object') {
        content = ''
      } else {
        const chunkContent = (chunk as { content?: unknown }).content
        if (typeof chunkContent === 'string') {
          content = chunkContent
        } else if (Array.isArray(chunkContent)) {
          content = chunkContent
            .map((part) => {
              if (typeof part === 'string') return part
              if (part && typeof part === 'object' && 'text' in part) {
                const text = (part as { text?: string }).text
                return typeof text === 'string' ? text : ''
              }
              return ''
            })
            .join('')
        } else {
          content = ''
        }
      }

      if (content) {
        fullContent += content
        if (streamDelayMs > 0) {
          for await (const char of streamWithCadence(
            content,
            signal,
            streamDelayMs,
          )) {
            yield { type: 'content', content: char }
          }
        } else {
          yield { type: 'content', content }
        }
      }
    }

    // Handle tool call chunks
    if ('toolCallChunks' in chunk && chunk.toolCallChunks) {
      const parsed = parseToolCallChunks(chunk.toolCallChunks as any)
      accumulatedToolCalls = parsed
    }
  }

  // Determine finish reason
  let finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' = 'stop'
  if (accumulatedToolCalls.length > 0) {
    finishReason = 'tool_calls'
  }

  // Compute usage if not provided by the model
  let computedUsage: Usage | undefined
  if (!finalUsage && fullContent) {
    const messagesText = messages
      .map((msg) => `${msg.getType()}: ${String(msg.content)}`)
      .join('\n\n')
    const promptTokens = countTokens(messagesText)
    const completionTokens = countTokens(fullContent)
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
}

/**
 * Stream text with artificial delay for smooth UX
 */
async function* streamWithCadence(
  text: string,
  signal?: AbortSignal,
  delayMs: number = 0,
): AsyncGenerator<string, void, unknown> {
  if (delayMs <= 0) {
    yield text
    return
  }

  for (const character of text) {
    if (signal?.aborted) {
      return
    }
    yield character
    await new Promise<void>((resolve) => {
      setTimeout(resolve, delayMs)
    })
  }
}
