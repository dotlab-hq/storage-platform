import { StateGraph, START, END } from '@langchain/langgraph'
import { MessagesState } from '@langchain/langgraph'
import type { BaseMessage } from '@langchain/core/messages'
import { ToolNode } from '@langchain/langgraph'
import type { StructuredTool } from '@langchain/core/tools'

/**
 * Multi-Agent Orchestration Graph v2
 *
 * Flow:
 * 1. START → supervisor
 * 2. supervisor[next] → agent node
 * 3. agent produces AI message (may have tool_calls)
 * 4. if tool_calls → tools
 * 5. tools produce ToolMessage → back to supervisor
 * 6. supervisor decides: another agent OR END
 */

export interface OrchestrationState extends MessagesState {
  next: string | null
  iteration: number
}

function supervisorNode(state: OrchestrationState): OrchestrationState {
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

function createAgentNode(tools: StructuredTool[]) {
  return async (state: OrchestrationState): Promise<OrchestrationState> => {
    const messages = state.messages as BaseMessage[]
    const { llm } = await import('@/llm/gemini.llm')

    const bound = tools.length > 0 ? llm.bindTools(tools) : llm
    const response = await bound.invoke(messages)

    const { AIMessage } = await import('@langchain/core/messages')
    const ai = new AIMessage(response.content || '')
    // @ts-ignore
    ai.tool_calls = response.tool_calls

    return {
      messages: [...messages, ai],
    }
  }
}

export function buildSupervisorGraph(
  agentTools: Record<string, StructuredTool[]>,
  allTools: StructuredTool[],
) {
  const graph = new StateGraph(OrchestrationState)

  // Add nodes
  graph.addNode('supervisor', supervisorNode)

  Object.entries(agentTools).forEach(([name, tools]) => {
    graph.addNode(name, createAgentNode(tools))
  })

  graph.addNode('tools', new ToolNode({ tools: allTools }))

  // START → supervisor
  graph.addEdge(START, 'supervisor')

  // Supervisor routing
  graph.addConditionalEdges('supervisor', (state: OrchestrationState) => {
    if (state.iteration >= 10) return END
    // If last message is AI with no pending tool calls → END
    const last = state.messages[state.messages.length - 1]
    if (last?._getType() === 'ai' && !(last as any)?.tool_calls?.length) {
      return END
    }
    // Otherwise route to chosen agent (or general if null)
    return state.next || 'general_agent'
  })

  // Agent → tools if tool calls, else → supervisor
  Object.keys(agentTools).forEach((name) => {
    graph.addConditionalEdges(name, (state: OrchestrationState) => {
      const last = state.messages[state.messages.length - 1] as any
      if (last?.tool_calls?.length > 0) {
        return 'tools'
      }
      return 'supervisor'
    })
  })

  // Tools always → supervisor
  graph.addEdge('tools', 'supervisor')

  return graph.compile({ name: 'supervisor_orchestrator' })
}
