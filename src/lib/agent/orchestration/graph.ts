import { StateGraph, START, END } from '@langchain/langgraph'
import { MessagesState } from '@langchain/langgraph'
import type { BaseMessage } from '@langchain/core/messages'
import type { StructuredTool } from '@langchain/core/tools'

/**
 * Supervisor Graph - Multi-Agent Orchestration
 *
 * Architecture: LangGraph Supervisor pattern
 * 1. Supervisor decides which worker agent to call
 * 2. Worker agent executes with its specific tool set
 * 3. If tools were called, go to tool execution node
 * 4. After tool results, back to supervisor
 * 5. Supervisor decides: call another agent or finish
 */

export const SUPERVISOR_ROUTE = 'supervisor'
export const WORKER_ROUTE = 'worker'

export interface SupervisorState extends MessagesState {
  // Next agent to route to
  next: string | null
  // Current active agent name
  currentAgent: string | null
  // Whether we just executed tools and need supervisor to review results
  needsSupervisorReview: boolean
  // Track iteration count
  iteration: number
}

/**
 * Create the supervisor routing node
 * Decides which worker should handle the current task
 */
export function createSupervisorNode() {
  return async function supervisorNode(
    state: SupervisorState,
  ): Promise<SupervisorState> {
    const messages = state.messages as BaseMessage[]

    // If we just came back from tool execution, review results and decide next
    if (state.needsSupervisorReview) {
      const lastMsg = messages[messages.length - 1]
      const hasToolResults = lastMsg?._getType() === 'tool'

      // If tool results exist, analyze them and decide
      if (hasToolResults) {
        // Simple heuristic: after tool results, let supervisor decide if more work needed
        return {
          ...state,
          needsSupervisorReview: false,
          next: null,
          iteration: state.iteration + 1,
        }
      }

      // No tool results - we're likely done
      return {
        ...state,
        needsSupervisorReview: false,
        next: END,
        iteration: state.iteration + 1,
      }
    }

    // Initial routing: decide which agent to use based on user request
    const userMessage = messages.find((m) => m._getType() === 'human')
    const content = (userMessage?.content || '').toString().toLowerCase()

    let chosenAgent = 'general_agent' // default

    // Simple keyword-based routing
    if (
      content.includes('search') ||
      content.includes('find') ||
      content.includes('web') ||
      content.includes('google') ||
      content.includes('latest') ||
      content.includes('news')
    ) {
      chosenAgent = 'web_agent'
    } else if (
      content.includes('file') ||
      content.includes('folder') ||
      content.includes('read') ||
      content.includes('write') ||
      content.includes('list') ||
      content.includes('storage')
    ) {
      chosenAgent = 'storage_agent'
    }

    return {
      ...state,
      next: chosenAgent,
      currentAgent: chosenAgent,
      iteration: state.iteration + 1,
    }
  }
}

/**
 * Tool execution node - executes tool calls (ToolNode)
 * Binds tools dynamically and executes in parallel
 */
export async function createToolNode(tools: StructuredTool[]) {
  return async function toolNode(
    state: SupervisorState,
    _config?: any,
  ): Promise<SupervisorState> {
    const messages = state.messages as BaseMessage[]
    const lastMessage = messages[messages.length - 1] as any

    const toolCalls = lastMessage?.tool_calls || []

    if (!toolCalls?.length) {
      return {
        ...state,
        needsSupervisorReview: true,
      }
    }

    try {
      const { executeToolCalls } =
        await import('@/routes/_app/chat/tools/-tool-executor')

      const results = await executeToolCalls(
        toolCalls.map((tc: any) => ({
          id: tc.id,
          function: {
            name: tc.name,
            arguments: JSON.stringify(tc.args || {}),
          },
        })),
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
        needsSupervisorReview: true,
        iteration: state.iteration,
      }
    } catch (error) {
      console.error('[ToolNode] Error:', error)
      throw error
    }
  }
}

/**
 * Build and compile the supervisor graph
 */
export function createSupervisorGraph(toolsByAgent: Record<string, any[]>) {
  const graph = new StateGraph(SupervisorState)
    .addNode('supervisor', createSupervisorNode())
    .addNode('reflect', createReflectNode())

  // Add worker nodes dynamically based on available agents
  Object.entries(toolsByAgent).forEach(([agentName, tools]) => {
    graph.addNode(agentName, createWorkerNode(agentName, tools))
  })

  // Add tool nodes for each agent type (executes tools assigned to that agent)
  Object.entries(toolsByAgent).forEach(([agentName, tools]) => {
    if (tools.length > 0) {
      graph.addNode(`${agentName}_tools`, createToolNode(tools))
    }
  })

  // Define edges
  graph.addEdge(START, 'supervisor')

  // Supervisor routes to workers
  graph.addConditionalEdges('supervisor', (state: SupervisorState) => {
    return state.next || END
  })

  // Workers with tool calls go to their tool executor
  Object.keys(toolsByAgent).forEach((agentName) => {
    graph.addConditionalEdges(agentName, (state: SupervisorState) => {
      const lastMsg = state.messages[state.messages.length - 1] as any
      const hasToolCalls = lastMsg?.tool_calls?.length > 0
      if (hasToolCalls && toolsByAgent[agentName].length > 0) {
        return `${agentName}_tools`
      }
      return 'reflect'
    })
  })

  // Tool nodes go to reflect
  Object.keys(toolsByAgent).forEach((agentName) => {
    if (toolsByAgent[agentName].length > 0) {
      graph.addEdge(`${agentName}_tools`, 'reflect')
    }
  })

  // Reflect decides: supervisor or END
  graph.addConditionalEdges('reflect', (state: SupervisorState) => {
    // Check if we need another agent turn
    if (state.iteration >= 10) {
      return END
    }

    const lastMsg = state.messages[state.messages.length - 1]
    // If last message is tool result, go back to supervisor
    if (lastMsg?._getType() === 'tool') {
      return 'supervisor'
    }

    // If last message is AI and no pending tool calls, end
    if (lastMsg?._getType() === 'ai') {
      return END
    }

    return 'supervisor'
  })

  return graph.compile({ name: 'supervisor_orchestrator' })
}

/**
 * Create the supervisor routing node
 * Decides which worker should handle the current task
 */
export function createSupervisorNode() {
  return async function supervisorNode(
    state: SupervisorState,
  ): Promise<SupervisorState> {
    const messages = state.messages as BaseMessage[]
    const lastMessage = messages[messages.length - 1]

    // If we're returning from a worker with tool results, let supervisor decide next
    if (state.toolExecutionPhase && state.pendingToolResults) {
      // Supervisor examines results, decides whether to route to another agent or finish
      return {
        ...state,
        toolExecutionPhase: false,
        pendingToolResults: null,
      }
    }

    // Initial routing: decide which agent to use based on user request
    const userMessage = messages.find((m) => m._getType() === 'human')
    const content = (userMessage?.content || '').toString().toLowerCase()

    let chosenAgent = 'general_agent' // default

    // Simple keyword-based routing
    if (
      content.includes('search') ||
      content.includes('find') ||
      content.includes('web') ||
      content.includes('google') ||
      content.includes('latest') ||
      content.includes('news')
    ) {
      chosenAgent = 'web_agent'
    } else if (
      content.includes('file') ||
      content.includes('folder') ||
      content.includes('read') ||
      content.includes('write') ||
      content.includes('list') ||
      content.includes('storage')
    ) {
      chosenAgent = 'storage_agent'
    }

    return {
      ...state,
      next: chosenAgent,
      currentAgent: chosenAgent,
    }
  }
}

/**
 * Create a worker agent node that executes with its specific tool set
 * Each agent type has its own LLM + tool configuration
 */
export function createWorkerNode(agentType: string, tools: any[]) {
  return async function workerNode(
    state: SupervisorState,
  ): Promise<SupervisorState> {
    const messages = state.messages as BaseMessage[]

    try {
      const { llm } = await import('@/llm/gemini.llm')

      // Bind tools to LLM
      const llmWithTools = tools.length > 0 ? llm.bindTools(tools) : llm

      // Invoke LLM with tools
      const response = await llmWithTools.invoke(messages)

      // Extract tool calls if any
      const toolCalls = (response as any)?.tool_calls || []

      // Track tools called in this turn
      const newCalledTools = new Set(state.calledTools || [])
      toolCalls.forEach((tc: any) => {
        newCalledTools.add(tc.name)
      })

      // Build assistant message
      const { AIMessage } = await import('@langchain/core/messages')
      const assistantMessage = new AIMessage(response.content || '')
      if (toolCalls.length > 0) {
        ;(assistantMessage as any)._tool_calls = toolCalls
      }

      const newMessages = [...messages, assistantMessage]

      // If tool calls present, go to tool execution phase
      if (toolCalls.length > 0) {
        return {
          messages: newMessages,
          next: null,
          currentAgent: agentType,
          pendingToolResults: [],
          toolExecutionPhase: true,
          calledTools: Array.from(newCalledTools),
        }
      }

      // No tools, so we're done with this agent
      return {
        messages: newMessages,
        next: END,
        currentAgent: agentType,
        pendingToolResults: null,
        toolExecutionPhase: false,
        calledTools: Array.from(newCalledTools),
      }
    } catch (error) {
      console.error(`[WorkerNode:${agentType}] Error:`, error)
      throw error
    }
  }
}

/**
 * Tool execution node - executes tool calls and returns results
 */
export async function toolExecutionNode(
  state: SupervisorState,
): Promise<SupervisorState> {
  const messages = state.messages as BaseMessage[]
  const lastMessage = messages[messages.length - 1] as any

  const toolCalls = lastMessage?.tool_calls || []

  if (!toolCalls?.length) {
    return {
      ...state,
      toolExecutionPhase: false,
      next: END,
    }
  }

  // Import tool executor dynamically to avoid circular deps
  const { executeToolCalls } =
    await import('@/routes/_app/chat/tools/-tool-executor')

  const results = await executeToolCalls(
    toolCalls.map((tc: any) => ({
      id: tc.id,
      function: {
        name: tc.name,
        arguments: JSON.stringify(tc.args || {}),
      },
    })),
  )

  // Create tool result messages
  const { ToolMessage } = await import('@langchain/core/messages')
  const toolMessages: BaseMessage[] = results.map((result) => {
    const content = result.error
      ? `ERROR: ${result.error}`
      : String(result.result)
    return new ToolMessage(content, result.toolCallId)
  })

  // Store results in state for supervisor
  const pendingToolResults = results.map((r) => ({
    toolCallId: r.toolCallId,
    toolName: r.toolName,
    result: r.result,
  }))

  return {
    messages: [...messages, ...toolMessages],
    next: 'supervisor', // Back to supervisor to decide next step
    currentAgent: null,
    pendingToolResults,
    toolExecutionPhase: false,
    calledTools: state.calledTools || [],
  }
}

/**
 * Reflection node - decides whether to continue routing or finish
 */
export function createReflectNode() {
  return async function reflectNode(
    state: SupervisorState,
  ): Promise<SupervisorState> {
    const messages = state.messages as BaseMessage[]

    // Check max iterations (simple guard)
    if (state.calledTools?.length >= 10) {
      return {
        ...state,
        next: END,
      }
    }

    // If last message is from assistant and has no pending tools, finish
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?._getType() === 'ai' && !state.toolExecutionPhase) {
      return {
        ...state,
        next: END,
      }
    }

    // If we just completed tool execution, go back to supervisor for next decision
    if (!state.toolExecutionPhase && state.pendingToolResults) {
      return {
        ...state,
        next: 'supervisor',
      }
    }

    return {
      ...state,
      next: 'supervisor',
    }
  }
}

/**
 * Build and compile the supervisor graph
 */
export function createSupervisorGraph(toolsByAgent: Record<string, any[]>) {
  const graph = new StateGraph(SupervisorState)
    .addNode('supervisor', createSupervisorNode())
    .addNode('tool_executor', toolExecutionNode)
    .addNode('reflect', createReflectNode())

  // Add worker nodes dynamically based on available agents
  Object.entries(toolsByAgent).forEach(([agentName, tools]) => {
    graph.addNode(agentName, createWorkerNode(agentName, tools))
  })

  // Define edges
  graph.addEdge(START, 'supervisor')

  // Supervisor routes to workers
  graph.addConditionalEdges('supervisor', (state: SupervisorState) => {
    return state.next || END
  })

  // All workers go to tool executor if tool calls made, else to reflect
  Object.keys(toolsByAgent).forEach((agentName) => {
    graph.addConditionalEdges(agentName, (state: SupervisorState) => {
      if (state.toolExecutionPhase) {
        return 'tool_executor'
      }
      return 'reflect'
    })
  })

  // Tool executor goes to reflect
  graph.addEdge('tool_executor', 'reflect')

  // Reflect decides: supervisor or END
  graph.addConditionalEdges('reflect', (state: SupervisorState) => {
    return state.next || END
  })

  return graph.compile({ name: 'supervisor_orchestrator' })
}
