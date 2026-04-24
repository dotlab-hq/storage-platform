import type { BaseMessage } from '@langchain/core/messages'
import type { DeepAgentState, DeepAgentMetadata } from './deep-agent.state'
import type { StructuredTool } from '@langchain/core/tools'

/**
 * Start node - Entry point of the agent graph
 * Validates input and initializes state
 */
export const startNode = async (
  state: DeepAgentState,
  _config?: any,
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
export const createAgentNode = (tools: StructuredTool[]) => {
  return async function* agentNode(
    state: DeepAgentState,
    _config?: any,
  ): AsyncGenerator<DeepAgentState, DeepAgentState, unknown> {
    const metadata: DeepAgentMetadata = {
      ...state.metadata,
      step: 'thinking',
      iteration: state.metadata.iteration + 1,
    }

    // Import LLM dynamically
    const { llm } = await import('@/llm/gemini.llm')

    // Prepare messages for LLM
    const messages: BaseMessage[] = state.messages

    try {
      // Bind tools to LLM for proper schema handling
      let llmWithTools = llm
      if (tools.length > 0) {
        llmWithTools = llm.bindTools(tools, { toolChoice: 'auto' })
        console.log(
          '[DeepAgent] Bound tools:',
          tools.map((t) => t.name),
        )
      }

      // Stream from LLM - this yields partial content for real-time updates
      const stream = await llmWithTools.stream(messages, {
        // No need to manually pass tools; bindTools already attached them
      })

      let fullContent = ''
      const allToolCallChunks: Array<{
        index: number
        id?: string
        name?: string
        args?: string
      }> = []

      // Yield intermediate states as we stream
      for await (const chunk of stream) {
        // Extract content and tool calls
        const content = (chunk as { content?: string })?.content || ''
        if (content) {
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
        if ('toolCallChunks' in chunk && chunk.toolCallChunks) {
          const toolChunks = chunk.toolCallChunks as Array<{
            index: number
            id?: string
            name?: string
            args?: string
          }>
          allToolCallChunks.push(...toolChunks)
        }
      }

      // Parse all accumulated tool call chunks into final tool calls
      const parsedToolCalls = parseToolCallChunks(allToolCallChunks)

      // Update state with final result
      const newMetadata: DeepAgentMetadata = {
        ...metadata,
        step: parsedToolCalls.length > 0 ? 'tool_execution' : 'end',
        reasoning: fullContent,
        activeToolCalls: parsedToolCalls.map((tc) => ({
          id: tc.id,
          name: tc.name,
          arguments: tc.arguments,
        })),
      }

      // Add assistant message to conversation
      const { AIMessage } = await import('@langchain/core/messages')
      const assistantMessage = new AIMessage(fullContent)
      if (parsedToolCalls.length > 0) {
        ;(assistantMessage as any).tool_calls = parsedToolCalls.map((tc) => ({
          id: tc.id,
          name: tc.name,
          arguments: tc.arguments,
        }))
      }

      return {
        messages: [...messages, assistantMessage],
        metadata: newMetadata,
      }
    } catch (error) {
      // Capture detailed error
      const err = error instanceof Error ? error : new Error(String(error))
      throw new Error(
        `[Agent LLM Error] ${err.message}\nStack: ${err.stack || 'No stack trace'}`,
      )
    }
  }
}

/**
 * Tool execution node - Runs tools in parallel
 */
export const toolNode = async (
  state: DeepAgentState,
  _config?: any,
): Promise<DeepAgentState> => {
  const metadata: DeepAgentMetadata = {
    ...state.metadata,
    step: 'reflection',
    activeToolCalls: undefined,
  }

  const toolCalls = state.metadata.activeToolCalls || []
  if (toolCalls.length === 0) {
    return { messages: state.messages, metadata }
  }

  try {
    // Execute all tools in parallel
    const { executeToolCalls } =
      await import('@/routes/_app/chat/tools/-tool-executor')

    const toolResults = await executeToolCalls(
      toolCalls.map((tc) => ({
        id: tc.id,
        type: 'function' as const,
        function: {
          name: tc.name,
          arguments: JSON.stringify(tc.arguments),
        },
      })),
    )

    // Create tool messages
    const { ToolMessage } = await import('@langchain/core/messages')
    const toolMessages: BaseMessage[] = toolResults.map((result) => {
      const content = result.error
        ? `ERROR: ${result.error}`
        : String(result.result)
      return new ToolMessage(content, result.toolCallId)
    })

    return {
      messages: [...state.messages, ...toolMessages],
      metadata: {
        ...metadata,
        toolResults: toolResults.map((r) => ({
          toolCallId: r.toolCallId,
          toolName: r.toolName,
          result: r.result,
          error: r.error,
        })),
      },
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
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
  _config?: any,
): Promise<DeepAgentState> => {
  const metadata = state.metadata

  // Check if we've hit max iterations
  if (state.metadata.iteration >= state.metadata.maxIterations) {
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
    (r) => !r.error && r.result,
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
function parseToolCallChunks(chunks: any[]): Array<{
  id: string
  name: string
  arguments: Record<string, unknown>
}> {
  const result: Array<{
    id: string
    name: string
    arguments: Record<string, unknown>
  }> = []

  for (const chunk of chunks) {
    if (chunk.index !== undefined && !result[chunk.index]) {
      result[chunk.index] = { id: '', name: '', arguments: {} }
    }
    const target = result[chunk.index]
    if (!target) continue

    if (chunk.id) target.id = chunk.id
    if (chunk.name) target.name = chunk.name
    if (chunk.arguments) {
      try {
        target.arguments = JSON.parse(chunk.arguments)
      } catch {
        target.arguments = {}
      }
    }
  }

  return result.filter((r) => r.id && r.name)
}
