import { getTool } from './-tool-registry'
import type { EnhancedTool } from './-tool-types'
import type { ToolExecutionContext, ToolResult } from './-tool-types'

export interface ToolExecutionResult {
  toolCallId: string
  toolName: string
  result: string
  error?: string
}

/**
 * Create execution context for a tool invocation
 */
function createContext(
  invocationId: string,
  userId?: string,
  threadId?: string,
): ToolExecutionContext {
  return {
    invocationId,
    userId: userId || 'anonymous',
    threadId: threadId || 'unknown',
    startedAt: new Date(),
    metadata: {},
  }
}

/**
 * Execute pre-hooks for a tool
 */
async function executePreHooks(
  tool: EnhancedTool,
  ctx: ToolExecutionContext,
  input: Record<string, unknown>,
): Promise<{
  allowed: boolean
  denyReason?: string
  modifiedInput: Record<string, unknown>
}> {
  if (!tool.onBeforeExecute) {
    return { allowed: true, modifiedInput: input }
  }

  const hookResult = await tool.onBeforeExecute(ctx, input)

  if (!hookResult.allowed) {
    return {
      allowed: false,
      denyReason: hookResult.denyReason || 'Execution denied by pre-hook',
      modifiedInput: input,
    }
  }

  return {
    allowed: true,
    modifiedInput: hookResult.modifiedInput || input,
  }
}

/**
 * Execute post-hooks for a tool
 */
async function executePostHooks(
  tool: EnhancedTool,
  ctx: ToolExecutionContext,
  result: ToolResult,
  durationMs: number,
): Promise<void> {
  if (tool.onAfterExecute) {
    await tool.onAfterExecute(ctx, result)
  }
}

/**
 * Execute a single enhanced tool call with full lifecycle support
 */
async function executeEnhancedTool(
  toolCall: {
    id: string
    function: {
      name: string
      arguments: string
    }
  },
  userId?: string,
  threadId?: string,
): Promise<ToolExecutionResult> {
  const tool = getTool(toolCall.function.name) as EnhancedTool | undefined

  if (!tool) {
    return {
      toolCallId: toolCall.id,
      toolName: toolCall.function.name,
      result: '',
      error: `Tool '${toolCall.function.name}' not found`,
    }
  }

  const ctx = createContext(toolCall.id, userId, threadId)
  let input: Record<string, unknown>

  try {
    // Parse arguments
    input = JSON.parse(toolCall.function.arguments)
  } catch (error) {
    return {
      toolCallId: toolCall.id,
      toolName: toolCall.function.name,
      result: '',
      error: `Invalid JSON arguments: ${error instanceof Error ? error.message : 'Parse error'}`,
    }
  }

  const startTime = Date.now()

  try {
    // Pre-hooks (validation, permission checks, input transformation)
    const preHookResult = await executePreHooks(tool, ctx, input)
    if (!preHookResult.allowed) {
      const durationMs = Date.now() - startTime
      const result: ToolResult = {
        success: false,
        error: preHookResult.denyReason,
        durationMs,
      }
      await executePostHooks(tool, ctx, result, durationMs)
      return {
        toolCallId: toolCall.id,
        toolName: toolCall.function.name,
        result: '',
        error: preHookResult.denyReason,
      }
    }

    input = preHookResult.modifiedInput

    // Validate with Zod schema (using enhanced input)
    let validated: unknown
    try {
      validated = await (tool.schema as any).parseAsync(input)
    } catch (schemaError) {
      const durationMs = Date.now() - startTime
      const errorMsg =
        schemaError instanceof Error
          ? schemaError.message
          : 'Schema validation failed'
      const result: ToolResult = {
        success: false,
        error: errorMsg,
        durationMs,
      }
      await executePostHooks(tool, ctx, result, durationMs)
      return {
        toolCallId: toolCall.id,
        toolName: toolCall.function.name,
        result: '',
        error: `Input validation failed: ${errorMsg}`,
      }
    }

    // Execute the tool (using the underlying StructuredTool's _call which calls execute)
    const rawResult = await tool._call(validated as Record<string, unknown>)
    const durationMs = Date.now() - startTime

    // Build successful result
    const result: ToolResult = {
      success: true,
      data: rawResult,
      durationMs,
    }

    // Post-hooks (logging, cache invalidation, etc.)
    await executePostHooks(tool, ctx, result, durationMs)

    return {
      toolCallId: toolCall.id,
      toolName: toolCall.function.name,
      result: String(rawResult),
    }
  } catch (error) {
    const durationMs = Date.now() - startTime
    const errorMessage =
      error instanceof Error ? error.message : 'Tool execution failed'
    const result: ToolResult = {
      success: false,
      error: errorMessage,
      durationMs,
    }
    await executePostHooks(tool, ctx, result, durationMs)
    return {
      toolCallId: toolCall.id,
      toolName: toolCall.function.name,
      result: '',
      error: errorMessage,
    }
  }
}

/**
 * Execute multiple tool calls
 * Enhanced version with lifecycle hooks, context, and proper error handling
 */
export async function executeToolCalls(
  toolCalls: Array<{
    id: string
    function: {
      name: string
      arguments: string
    }
  }>,
  userId?: string,
  threadId?: string,
): Promise<ToolExecutionResult[]> {
  // Execute tools in parallel (they're independent)
  const results = await Promise.all(
    toolCalls.map((toolCall) =>
      executeEnhancedTool(toolCall, userId, threadId),
    ),
  )

  return results
}
