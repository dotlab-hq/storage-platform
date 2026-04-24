import { StateGraph, START, END, type GraphNode } from '@langchain/langgraph'
import type { DeepAgentState } from './deep-agent.state'
import { StateGraph, START, END, type GraphNode } from '@langchain/langgraph'
import { DeepAgentStateSchema } from './deep-agent.state'
import type { DeepAgentState } from './deep-agent.state'
import {
  startNode,
  createAgentNode,
  toolNode,
  reflectNode,
} from './deep-agent.nodes'

/**
 * Creates and compiles the DeepAgent graph
 *
 * Architecture: START -> start_node -> agent_node -> tool_node -> reflect_node -> (back to agent or END)
 *
 * This creates a loop:
 *   1. Agent thinks and decides on tools
 *   2. Tools execute
 *   3. Reflect: if more tools needed, back to agent; else END
 */
export function createDeepAgentGraph(tools: any[] = []) {
  // Define the graph
  const graph = new StateGraph<DeepAgentState>({
    name: 'deep_agent',
    stateSchema: DeepAgentStateSchema,
  })

  // Add nodes
  graph.addNode('start', startNode as GraphNode<typeof DeepAgentStateSchema>)
  graph.addNode(
    'agent',
    createAgentNode(tools) as GraphNode<typeof DeepAgentStateSchema>,
  )
  graph.addNode('tool', toolNode as GraphNode<typeof DeepAgentStateSchema>)
  graph.addNode(
    'reflect',
    reflectNode as GraphNode<typeof DeepAgentStateSchema>,
  )

  // Define edges
  graph.addEdge(START, 'start')
  graph.addEdge('start', 'agent')

  // Agent can either use tools or finish
  graph.addConditionalEdges('agent', (state) => {
    const step = state.metadata?.step
    if (step === 'tool_execution') {
      return 'tool'
    }
    return END
  })

  // After tools, reflect on whether to continue
  graph.addEdge('tool', 'reflect')
  graph.addConditionalEdges('reflect', (state) => {
    const step = state.metadata?.step
    if (step === 'thinking') {
      return 'agent'
    }
    return END
  })

  // Compile and return
  return graph.compile()
}

/**
 * DeepAgent stream result - emitted during execution
 */
export interface DeepAgentStreamChunk {
  type:
    | 'step_start'
    | 'step_complete'
    | 'reasoning'
    | 'tool_call'
    | 'tool_result'
    | 'final'
    | 'error'
  step?: string
  reasoning?: string
  toolCall?: {
    id: string
    name: string
    arguments: Record<string, unknown>
  }
  toolResult?: {
    toolCallId: string
    toolName: string
    result?: string
    error?: string
  }
  message?: string
  error?: {
    message: string
    stack?: string
    node?: string
  }
  iteration?: number
  done?: boolean
}

/**
 * Run the DeepAgent graph with streaming output
 */
export async function* runDeepAgent(
  messages: BaseMessage[],
  tools: any[] = [],
  signal?: AbortSignal,
): AsyncGenerator<DeepAgentStreamChunk, void, unknown> {
  const graph = createDeepAgentGraph(tools)

  // Initial state
  const initialState: DeepAgentState = {
    messages,
    metadata: {
      step: 'start',
      iteration: 0,
      maxIterations: 10,
    },
  }

  try {
    // Stream the graph execution
    for await (const event of graph.stream(initialState, {
      streamMode: 'custom',
      streamChannel: 'custom',
    })) {
      if (signal?.aborted) {
        yield {
          type: 'error',
          error: {
            message: 'Execution aborted by user',
            node: 'signal',
          },
          done: true,
        }
        return
      }

      // Parse event and emit appropriate chunk
      const state = event as DeepAgentState
      const meta = state.metadata

      // Emit step transitions
      if (meta.step) {
        yield {
          type: 'step_complete',
          step: meta.step,
          iteration: meta.iteration,
        }
      }

      // Emit reasoning if available
      if (meta.reasoning) {
        yield {
          type: 'reasoning',
          reasoning: meta.reasoning,
        }
      }

      // Emit tool calls
      if (meta.activeToolCalls && meta.activeToolCalls.length > 0) {
        for (const tc of meta.activeToolCalls) {
          yield {
            type: 'tool_call',
            toolCall: {
              id: tc.id,
              name: tc.name,
              arguments: tc.arguments,
            },
          }
        }
      }

      // Emit tool results
      if (meta.toolResults && meta.toolResults.length > 0) {
        for (const result of meta.toolResults) {
          yield {
            type: 'tool_result',
            toolResult: {
              toolCallId: result.toolCallId,
              toolName: result.toolName,
              result: result.result,
              error: result.error,
            },
          }
        }
      }

      // Check for errors
      if (meta.error) {
        yield {
          type: 'error',
          error: {
            message: meta.error.message,
            stack: meta.error.stack,
            node: meta.error.node,
          },
          done: true,
        }
        return
      }

      // Check if done
      if (meta.step === 'end') {
        yield {
          type: 'final',
          message: state.messages[state.messages.length - 1]?.content as string,
          done: true,
        }
        return
      }
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    yield {
      type: 'error',
      error: {
        message: err.message,
        stack: err.stack,
        node: 'graph',
      },
      done: true,
    }
  }
}
