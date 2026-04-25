import {
  StateGraph,
  START,
  END,
  MessagesValue,
  StateSchema,
} from '@langchain/langgraph'
import type { BaseMessage } from '@langchain/core/messages'
import { ToolNode } from '@langchain/langgraph'
import { z } from 'zod'

/**
 * Simple Supervisor Orchestration Graph
 *
 * States:
 * 1. supervisor - decides which agent to invoke
 * 2. agent nodes (web_agent, general_agent) - LLM + tools
 * 3. tools - execute tool calls (ToolNode)
 * 4. back to supervisor for next decision, or END
 */

export interface OrchestrationState {
  messages: BaseMessage[]
  // Next agent to invoke (e.g., "web_agent", "general_agent")
  next: string | null
  // Track iteration count to prevent infinite loops
  iteration: number
}

const OrchestrationStateSchema = new StateSchema({
  messages: MessagesValue,
  next: z.string().nullable(),
  iteration: z.number(),
})

/**
 * Supervisor node: decides which agent should handle the request
 */
export function createSupervisorNode() {
  return async function supervisorNode(
    state: OrchestrationState,
  ): Promise<OrchestrationState> {
    const messages = state.messages as BaseMessage[]
    const userMessage = messages.find((m) => m._getType() === 'human')
    const content = (userMessage?.content || '').toString().toLowerCase()

    // Simple routing based on intent detection
    let chosenAgent = 'general_agent' // default

    if (
      content.includes('search') ||
      content.includes('find') ||
      content.includes('web') ||
      content.includes('google') ||
      content.includes('latest') ||
      content.includes('news')
    ) {
      chosenAgent = 'web_agent'
    }

    return {
      ...state,
      next: chosenAgent,
      iteration: state.iteration + 1,
    }
  }
}

/**
 * Build supervisor graph with agent-specific tool nodes
 */
export function buildSupervisorGraph(
  agents: Record<string, { tools: any[]; llm: any }>,
) {
  const graph = new StateGraph(OrchestrationStateSchema).addNode(
    'supervisor',
    createSupervisorNode(),
  )

  // Add each agent as an LLM node
  Object.entries(agents).forEach(([name, config]) => {
    graph.addNode(name, async (state: OrchestrationState) => {
      const messages = state.messages as BaseMessage[]
      const { llm } = await import('@/llm/gemini.llm')

      const bound = config.tools.length > 0 ? llm.bindTools(config.tools) : llm
      const response = await bound.invoke(messages)

      const { AIMessage } = await import('@langchain/core/messages')
      const aiMsg = new AIMessage(response.content || '')
      // @ts-ignore
      aiMsg.tool_calls = response.tool_calls

      return {
        messages: [...messages, aiMsg],
      }
    })
  })

  // Add tool node (executes any tool call)
  graph.addNode('tools', new ToolNode())

  // Edge mappings
  graph.addEdge(START, 'supervisor')

  // Supervisor -> agent (based on next)
  graph.addConditionalEdges('supervisor', (state: OrchestrationState) => {
    return state.next || END
  })

  // Agent has tool calls? -> tools, else -> supervisor
  Object.keys(agents).forEach((agentName) => {
    graph.addConditionalEdges(agentName, (state: OrchestrationState) => {
      const lastMsg = state.messages[state.messages.length - 1] as any
      if (lastMsg?.tool_calls?.length > 0) {
        return 'tools'
      }
      return 'supervisor'
    })
  })

  // Tools -> supervisor for next decision
  graph.addEdge('tools', 'supervisor')

  // Supervisor decides to end
  graph.addConditionalEdges('supervisor', (state: OrchestrationState) => {
    if (state.iteration >= 10) return END
    const lastMsg = state.messages[state.messages.length - 1]
    if (lastMsg?._getType() === 'ai' && !lastMsg?.tool_calls?.length) return END
    // default: loop back to supervisor for next decision
    return 'supervisor'
  })

  return graph.compile({ name: 'supervisor_orchestrator_v2' })
}
