import type { BaseMessage } from '@langchain/core/messages'
import type { DeepAgentState, DeepAgentMetadata } from './deep-agent.state'
import type { StructuredTool } from '@langchain/core/tools'
import type { EnhancedTool } from '@/routes/_app/chat/tools/-tool-types'
import type { RunnableConfig } from '@langchain/core/runnables'
import { normalizeOpenAiContent } from '@/utils/normalize-openai-message'

/**
 * Start node - Entry point of the agent graph
 * Validates input and initializes state
 */
export const startNode = async (
  state: DeepAgentState,
  _config?: RunnableConfig,
): Promise<DeepAgentState> => {
  const metadata: DeepAgentMetadata = {
    ...state.metadata,
    step: 'thinking',
    iteration: 0,
    error: undefined,
  }

  return {
    messages: state.messages,
    metadata,
  }
}

/**
 * Agent node - Core reasoning step
 * Calls the LLM with tools and streams reasoning
 */
export const createAgentNode = (
  tools: Array<StructuredTool | EnhancedTool>,
) => {
  return async function* agentNode(
    state: DeepAgentState,
    _config?: RunnableConfig,
  ): AsyncGenerator<DeepAgentState, DeepAgentState, unknown> {
    const metadata: DeepAgentMetadata = {
      ...state.metadata,
      step: 'thinking',
      iteration: state.metadata.iteration + 1,
    }

    // Import LLM dynamically
    const { llm } = await import( '@/llm/gemini.llm' )

    // Prepare messages for LLM
    const messages: BaseMessage[] = state.messages

    try {
      // Bind tools to LLM for proper schema handling
      let llmWithTools: { stream: typeof llm.stream } = llm
      if ( tools.length > 0 ) {
        llmWithTools = llm.bindTools( tools as StructuredTool[], {
          tool_choice: 'auto',
        } )
        console.log(
          '[DeepAgent] Bound tools:',
          tools.map( ( t ) => t.name ),
        )
      }

      // Stream from LLM - this yields partial content for real-time updates
      const stream = await llmWithTools.stream( messages, {
        // No need to manually pass tools; bindTools already attached them
      } )

      let fullContent = ''
      const allToolCallChunks: Array<{
        index: number
        id?: string
        name?: string
        args?: string
      }> = []

      // Yield intermediate states as we stream
      for await ( const chunk of stream ) {
        const chunkRecord =
          chunk && typeof chunk === 'object'
            ? ( chunk as unknown as Record<string, unknown> )
            : {}
        const normalizedContent = normalizeOpenAiContent(
          chunkRecord.contentBlocks ?? chunkRecord.content,
        )
        const content = normalizedContent.text
        if ( content ) {
          fullContent += content
          // Yield partial content for streaming
          yield {
            messages,
            metadata: {
              ...metadata,
              reasoning: fullContent,
            },
          }
        }

        // Check for tool call chunks - accumulate raw chunks
        if ( 'toolCallChunks' in chunk && chunk.toolCallChunks ) {
          const toolChunks = chunk.toolCallChunks as Array<{
            index: number
            id?: string
            name?: string
            args?: string
          }>
          allToolCallChunks.push( ...toolChunks )
        }
      }

      // Parse all accumulated tool call chunks into final tool calls
      const parsedToolCalls = parseToolCallChunks( allToolCallChunks )

      // Update state with final result
      const newMetadata: DeepAgentMetadata = {
        ...metadata,
        step: parsedToolCalls.length > 0 ? 'tool_execution' : 'end',
        reasoning: fullContent,
        activeToolCalls: parsedToolCalls.map( ( tc ) => ( {
          id: tc.id,
          name: tc.name,
          arguments: tc.arguments,
        } ) ),
      }

      // Add assistant message to conversation
      const { AIMessage } = await import( '@langchain/core/messages' )
      const assistantMessage = new AIMessage( fullContent )
      if ( parsedToolCalls.length > 0 ) {
        assistantMessage.tool_calls = parsedToolCalls.map( ( tc ) => ( {
          id: tc.id,
          name: tc.name,
          args: tc.arguments,
          type: 'tool_call' as const,
        } ) )
      }

      return {
        messages: [...messages, assistantMessage],
        metadata: newMetadata,
      }
    } catch ( error ) {
      // Capture detailed error
      const err = error instanceof Error ? error : new Error( String( error ) )
      throw new Error(
        `[Agent LLM Error] ${err.message}\nStack: ${err.stack || 'No stack trace'}`,
      )
    }
  }
}

/**
 * Tool execution node - Runs tools in parallel with user context
 */
export const toolNode = async (
  state: DeepAgentState,
  _config?: RunnableConfig,
): Promise<DeepAgentState> => {
  const metadata: DeepAgentMetadata = {
    ...state.metadata,
    step: 'reflection',
    activeToolCalls: undefined,
  }

  const toolCalls = state.metadata.activeToolCalls || []
  if ( toolCalls.length === 0 ) {
    return { messages: state.messages, metadata }
  }

  try {
    // Extract user context from state metadata
    const userId = state.metadata.userId
    const threadId = state.metadata.threadId

    // Execute all tools in parallel with context
    const { executeToolCalls } =
      await import( '@/routes/_app/chat/tools/-tool-executor' )

    const toolResults = await executeToolCalls(
      toolCalls.map( ( tc ) => ( {
        id: tc.id,
        type: 'function' as const,
        function: {
          name: tc.name,
          arguments: JSON.stringify( tc.arguments ),
        },
      } ) ),
      userId,
      threadId,
    )

    // Create tool messages
    const { ToolMessage } = await import( '@langchain/core/messages' )
    const toolMessages: BaseMessage[] = toolResults.map( ( result ) => {
      const content = result.error
        ? `ERROR: ${result.error}`
        : String( result.result )
      return new ToolMessage( content, result.toolCallId )
    } )

    return {
      messages: [...state.messages, ...toolMessages],
      metadata: {
        ...metadata,
        toolResults: toolResults.map( ( r ) => ( {
          toolCallId: r.toolCallId,
          toolName: r.toolName,
          result: r.result,
          error: r.error,
        } ) ),
      },
    }
  } catch ( error ) {
    const err = error instanceof Error ? error : new Error( String( error ) )
    throw new Error(
      `[Tool Execution Error] ${err.message}\nStack: ${err.stack || 'No stack trace'}`,
    )
  }
}

/**
 * Reflection node - Decides whether to continue or end
 */
export const reflectNode = async (
  state: DeepAgentState,
  _config?: RunnableConfig,
): Promise<DeepAgentState> => {
  const metadata = state.metadata

  // Check if we've hit max iterations
  if ( state.metadata.iteration >= state.metadata.maxIterations ) {
    return {
      messages: state.messages,
      metadata: {
        ...metadata,
        step: 'end',
        error: {
          message: `Maximum iterations (${state.metadata.maxIterations}) reached`,
          node: 'reflect',
        },
      },
    }
  }

  // Check if the last message indicates completion
  // If no tool call results pending, end
  const hasToolResults = state.metadata.toolResults?.some(
    ( r ) => !r.error && r.result,
  )

  return {
    messages: state.messages,
    metadata: {
      ...metadata,
      step: hasToolResults ? 'thinking' : 'end',
    },
  }
}

/**
 * Parse tool call chunks from LLM stream
 */
function parseToolCallChunks( chunks: unknown[] ): Array<{
  id: string
  name: string
  arguments: Record<string, unknown>
}> {
  const result: Array<{
    id: string
    name: string
    arguments: Record<string, unknown>
  }> = []

  for ( const chunk of chunks ) {
    if ( !chunk || typeof chunk !== 'object' ) continue
    const record = chunk as Record<string, unknown>
    if ( typeof record.index !== 'number' ) continue
    if ( !result[record.index] ) {
      result[record.index] = { id: '', name: '', arguments: {} }
    }
    const target = result[record.index]
    if ( !target ) continue

    if ( typeof record.id === 'string' ) target.id = record.id
    if ( typeof record.name === 'string' ) target.name = record.name
    if ( typeof record.args === 'string' ) {
      try {
        const parsedArgs: unknown = JSON.parse( record.args )
        target.arguments =
          parsedArgs && typeof parsedArgs === 'object'
            ? ( parsedArgs as Record<string, unknown> )
            : {}
      } catch {
        target.arguments = {}
      }
    }
  }

  return result.filter( ( r ) => r.id && r.name )
}
