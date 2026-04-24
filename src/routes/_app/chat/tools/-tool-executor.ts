import { getTool } from './-tool-registry'

export interface ToolExecutionResult {
  toolCallId: string
  toolName: string
  result: string
  error?: string
}

/**
 * Execute a single tool call with validation
 */
async function executeSingleTool(toolCall: {
  id: string
  function: {
    name: string
    arguments: string
  }
}): Promise<ToolExecutionResult> {
  const tool = getTool(toolCall.function.name)

  if (!tool) {
    return {
      toolCallId: toolCall.id,
      toolName: toolCall.function.name,
      result: '',
      error: `Tool '${toolCall.function.name}' not found`,
    }
  }

  try {
    // Parse and validate arguments
    const args = JSON.parse(toolCall.function.arguments)

    // Validate with Zod schema
    const validated = await (tool.schema as any).parseAsync(args)

    // Execute the tool
    const result = await tool.call(validated)

    return {
      toolCallId: toolCall.id,
      toolName: toolCall.function.name,
      result: String(result),
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Tool execution failed'
    return {
      toolCallId: toolCall.id,
      toolName: toolCall.function.name,
      result: '',
      error: errorMessage,
    }
  }
}

/**
 * Execute multiple tool calls in sequence (or parallel if independent)
 */
export async function executeToolCalls(
  toolCalls: Array<{
    id: string
    function: {
      name: string
      arguments: string
    }
  }>,
): Promise<ToolExecutionResult[]> {
  // Execute tools in parallel (they're independent math operations)
  const results = await Promise.all(
    toolCalls.map((toolCall) => executeSingleTool(toolCall)),
  )

  return results
}
