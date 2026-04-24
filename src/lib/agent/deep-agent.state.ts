import { MessagesValue, StateSchema } from '@langchain/langgraph'
import { z } from 'zod'

/**
 * Metadata schema for the agent execution
 */
const MetadataSchema = z.object({
  /**
   * Current step in the agent flow
   */
  step: z
    .enum(['start', 'thinking', 'tool_execution', 'reflection', 'end'])
    .default('start'),

  /**
   * Reasoning/thinking content from the agent
   */
  reasoning: z.string().optional(),

  /**
   * Current tool calls being executed
   */
  activeToolCalls: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        arguments: z.record(z.string(), z.any()),
      }),
    )
    .optional(),

  /**
   * Results from tool executions
   */
  toolResults: z
    .array(
      z.object({
        toolCallId: z.string(),
        toolName: z.string(),
        result: z.string().optional(),
        error: z.string().optional(),
      }),
    )
    .optional(),

  /**
   * Error information if something went wrong
   */
  error: z
    .object({
      message: z.string(),
      stack: z.string().optional(),
      node: z.string().optional(),
      details: z.record(z.string(), z.any()).optional(),
    })
    .optional(),

  /**
   * Iteration count to prevent infinite loops
   */
  iteration: z.number().default(0),

  /**
   * Maximum iterations allowed
   */
  maxIterations: z.number().default(10),
})

/**
 * DeepAgent state schema - defines the shape of state throughout the graph
 */
export const DeepAgentStateSchema = new StateSchema({
  /**
   * Conversation history - all messages exchanged
   */
  messages: MessagesValue,

  /**
   * Metadata about the current agent execution
   */
  metadata: MetadataSchema,
})

export type DeepAgentState = typeof DeepAgentStateSchema.State
export type DeepAgentMetadata = DeepAgentState['metadata']
