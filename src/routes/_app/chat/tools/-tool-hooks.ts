import type {
  PreToolUseHook,
  PostToolUseHook,
  ToolExecutionContext,
  ToolResult,
  PreToolUseResult,
} from './-tool-types'

/**
 * Built-in pre-tool use hooks
 */

/**
 * Logging hook - logs all tool invocations
 */
export const loggingPreHook: PreToolUseHook = async (ctx, toolName, input) => {
  console.log(
    `[Tool] ${toolName} invoked by user ${ctx.userId}`,
    'input:',
    JSON.stringify(input).slice(0, 200),
    'metadata:',
    ctx.metadata,
  )
  return { allowed: true }
}

/**
 * Permission checking hook
 */
export const permissionHook: PreToolUseHook = async (ctx, toolName, input) => {
  // This hook requires an external permission checker
  // It will be configured by the orchestrator with actual implementation
  return { allowed: true }
}

/**
 * Rate limiting hook - placeholder for future implementation
 */
export const rateLimitHook: PreToolUseHook = async (ctx, toolName, input) => {
  // Check user's rate limit for this tool
  // Return { allowed: false, denyReason: 'Rate limit exceeded' } if exceeded
  return { allowed: true }
}

/**
 * Audit logging hook - records all executions for compliance
 */
export const auditPreHook: PreToolUseHook = async (ctx, toolName, input) => {
  // TODO: Write to audit log table
  // auditLog.insert({
  //   userId: ctx.userId,
  //   threadId: ctx.threadId,
  //   toolName,
  //   input: JSON.stringify(input),
  //   timestamp: new Date(),
  // })
  return { allowed: true }
}

/**
 * Input sanitization hook - strips sensitive data from logs
 */
export const sanitizeInputHook: PreToolUseHook = async (
  ctx,
  toolName,
  input,
) => {
  // Remove or redact sensitive fields before logging
  const sanitized = { ...input }
  // Example: sanitized.apiKey = '[REDACTED]'
  return { allowed: true }
}

/**
 * Combined pre-tool hook runner
 */
export async function runPreHooks(
  hooks: PreToolUseHook[],
  ctx: ToolExecutionContext,
  toolName: string,
  input: Record<string, unknown>,
): Promise<PreToolUseResult> {
  for (const hook of hooks) {
    try {
      const result = await hook(ctx, toolName, input)
      if (!result.allowed) {
        return result
      }
      // If hook modified input, merge it
      if (result.modifiedInput) {
        Object.assign(input, result.modifiedInput)
      }
      // Collect warnings
      if (result.warnings) {
        // Store warnings in context for post-hooks
        ctx.metadata.hookWarnings = [
          ...((ctx.metadata.hookWarnings as string[]) || []),
          ...result.warnings,
        ]
      }
    } catch (error) {
      console.error(`[PreHook] Hook failed for ${toolName}:`, error)
      // Fail closed on hook errors
      return {
        allowed: false,
        denyReason: `Pre-execution check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
  return { allowed: true }
}

/**
 * Built-in post-tool use hooks
 */

/**
 * Logging hook - logs results and duration
 */
export const loggingPostHook: PostToolUseHook = async (
  ctx,
  toolName,
  result,
  durationMs,
) => {
  const status = result.success ? '✓' : '✗'
  console.log(
    `[Tool] ${status} ${toolName}`,
    `duration: ${durationMs}ms`,
    result.success
      ? `result: ${JSON.stringify(result.data).slice(0, 100)}`
      : `error: ${result.error}`,
  )
}

/**
 * Metrics hook - sends metrics to monitoring
 */
export const metricsPostHook: PostToolUseHook = async (
  ctx,
  toolName,
  result,
  durationMs,
) => {
  // TODO: Send to metrics system
  // metrics.increment('tool.execution', { tool: toolName, success: result.success })
  // metrics.timing('tool.duration', durationMs, { tool: toolName })
}

/**
 * Cache invalidation hook - clears relevant caches after mutations
 */
export const cacheInvalidationHook: PostToolUseHook = async (
  ctx,
  toolName,
  result,
) => {
  if (!result.success) return

  // Invalidate file listing caches after write/delete operations
  const mutatingTools = ['write_file', 'delete_file', 'create_directory']
  if (mutatingTools.includes(toolName)) {
    // cache.deletePattern(`file_list:*, { bucket: '*' }`)
  }
}

/**
 * Run all post-execution hooks
 */
export async function runPostHooks(
  hooks: PostToolUseHook[],
  ctx: ToolExecutionContext,
  toolName: string,
  result: ToolResult,
  durationMs: number,
): Promise<void> {
  const promises = hooks.map((hook) =>
    hook(ctx, toolName, result, durationMs).catch((error) => {
      console.error(`[PostHook] Hook failed for ${toolName}:`, error)
    }),
  )
  await Promise.all(promises)
}
