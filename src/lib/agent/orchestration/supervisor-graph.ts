import {
  StateGraph,
  START,
  END,
  MessagesValue,
  StateSchema,
} from '@langchain/langgraph'
import type { BaseMessage } from '@langchain/core/messages'
import type { StructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { executeToolCalls } from '@/routes/_app/chat/tools/-tool-executor'

const OrchestrationStateSchema = new StateSchema({
  messages: MessagesValue,
  next: z.string().nullable(),
  iteration: z.number(),
  userId: z.string().optional(),
  threadId: z.string().optional(),
})

export interface OrchestrationState {
  messages: BaseMessage[]
  next: string | null
  iteration: number
  // Optional metadata for tool execution
  userId?: string
  threadId?: string
}

export function createSupervisorNode() {
  return function supervisorNode(
    state: OrchestrationState,
  ): OrchestrationState {
    const messages = state.messages as BaseMessage[]
    const userMsg = messages.find((m) => m._getType() === 'human')
    const content = String(userMsg?.content || '').toLowerCase()

    // If we're back from tool execution, re-evaluate
    const lastMsg = messages[messages.length - 1]
    if (lastMsg?._getType() === 'tool') {
      return {
        ...state,
        next: null,
        iteration: state.iteration + 1,
      }
    }

    // Initial routing based on user request
    let agent = 'general_agent'
    if (
      content.includes('search') ||
      content.includes('web') ||
      content.includes('google') ||
      content.includes('find out') ||
      content.includes('latest')
    ) {
      agent = 'web_agent'
    }

    return {
      ...state,
      next: agent,
      iteration: state.iteration + 1,
    }
  }
}

export function createWorkerNode(agentType: string, tools: StructuredTool[]) {
  return async (state: OrchestrationState): Promise<OrchestrationState> => {
    const messages = state.messages as BaseMessage[]
    const { llm } = await import('@/llm/gemini.llm')

    const bound = tools.length > 0 ? llm.bindTools(tools) : llm
    const response = await bound.invoke(messages)

    const { AIMessage } = await import('@langchain/core/messages')
    const ai = new AIMessage(response.content || '')
    const responseWithToolCalls = response as { tool_calls?: unknown[] }
    if (responseWithToolCalls.tool_calls) {
      ;(ai as AIMessage & { tool_calls?: unknown[] }).tool_calls =
        responseWithToolCalls.tool_calls
    }

    return {
      messages: [...messages, ai],
    }
  }
}

/**
 * Tool execution node using enhanced executor with user context
 */
function createToolExecutionNode(
  tools: StructuredTool[],
  userId?: string,
  threadId?: string,
) {
  return async (state: OrchestrationState): Promise<OrchestrationState> => {
    const messages = state.messages as BaseMessage[]
    const lastMessage = messages[messages.length - 1] as any

    const toolCalls = lastMessage?.tool_calls || []

    if (!toolCalls?.length) {
      return {
        ...state,
        next: 'supervisor',
      }
    }

    // Execute tools with user context for hooks
    const results = await executeToolCalls(
      toolCalls.map((tc: any) => ({
        id: tc.id,
        function: {
          name: tc.name,
          arguments: JSON.stringify(tc.args || {}),
        },
      })),
      userId,
      threadId,
    )

    // Create tool result messages
    const { ToolMessage } = await import('@langchain/core/messages')
    const toolMessages: BaseMessage[] = results.map((result) => {
      const content = result.error
        ? `ERROR: ${result.error}`
        : String(result.result)
      return new ToolMessage(content, result.toolCallId)
    })

    return {
      messages: [...messages, ...toolMessages],
      iteration: state.iteration,
    }
  }
}

export function buildSupervisorGraph(
  agentTools: Record<string, StructuredTool[]>,
  allTools: StructuredTool[],
  userContext?: { userId?: string; threadId?: string },
) {
  const graph = new StateGraph(OrchestrationStateSchema)

  // Add nodes
  graph.addNode('supervisor', createSupervisorNode())

  Object.entries(agentTools).forEach(([name, tools]) => {
    graph.addNode(name, createWorkerNode(name, tools))
  })

  // Add tool execution node with user context
  graph.addNode(
    'tools',
    createToolExecutionNode(
      allTools,
      userContext?.userId,
      userContext?.threadId,
    ),
  )

  // START -> supervisor
  graph.addEdge(START, 'supervisor')

  // Supervisor routing
  graph.addConditionalEdges('supervisor', (state: OrchestrationState) => {
    if (state.iteration >= 10) return END
    // If last message is AI with no pending tool calls -> END
    const last = state.messages[state.messages.length - 1]
    if (last?._getType() === 'ai' && !(last as any)?.tool_calls?.length) {
      return END
    }
    // Otherwise route to chosen agent (or general if null)
    return state.next || 'general_agent'
  })

  // Agent -> tools if tool calls, else -> supervisor
  Object.keys(agentTools).forEach((name) => {
    graph.addConditionalEdges(name, (state: OrchestrationState) => {
      const last = state.messages[state.messages.length - 1] as any
      if (last?.tool_calls?.length > 0) {
        return 'tools'
      }
      return 'supervisor'
    })
  })

  // Tools always -> supervisor
  graph.addEdge('tools', 'supervisor')

  return graph.compile({ name: 'supervisor_orchestrator' })
}
