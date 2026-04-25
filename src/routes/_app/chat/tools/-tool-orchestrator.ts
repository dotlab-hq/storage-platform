import type {
  EnhancedTool,
  ToolOrchestratorConfig,
  ToolExecutionContext,
  ToolExecutionRequest,
  ToolExecutionResponse,
  ToolBatch,
  ToolResult,
  ToolProgress,
  PreToolUseResult,
} from './-tool-types'
import {
  runPreHooks,
  runPostHooks,
  loggingPreHook,
  auditPreHook,
  sanitizeInputHook,
  loggingPostHook,
  metricsPostHook,
  cacheInvalidationHook,
} from './-tool-hooks'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789abcdef', 21)

function generateId(): string {
  return `call_${nanoid()}`
}

/**
 * ToolOrchestrator - Centralized tool execution manager
 *
 * Responsibilities:
 * - Batch partition (concurrent-safe vs serial dependencies)
 * - Context creation and lifecycle
 * - Hook execution (pre/post)
 * - Error handling and aggregation
 * - Progress reporting
 *
 * Inspired by Claude Code's toolOrchestration.ts
 */
export class ToolOrchestrator {
  private config: Required<ToolOrchestratorConfig>
  private tools: Map<string, EnhancedTool>

  constructor(config: ToolOrchestratorConfig = {}) {
    this.config = {
      maxConcurrency: config.maxConcurrency ?? 5,
      maxIterations: config.maxIterations ?? 10,
      preHooks: config.preHooks ?? [runPreHooks.bind(null, [])],
      postHooks: config.postHooks ?? [],
      enableProgressReporting: config.enableProgressReporting ?? false,
      permissionChecker: config.permissionChecker ?? (async () => true),
    }
    this.tools = new Map()
  }

  /**
   * Register a tool with the orchestrator
   */
  register(tool: EnhancedTool): void {
    if (this.tools.has(tool.name)) {
      console.warn(
        `[Orchestrator] Tool "${tool.name}" is already registered, overwriting`,
      )
    }
    this.tools.set(tool.name, tool)
  }

  /**
   * Register multiple tools at once
   */
  registerAll(tools: EnhancedTool[]): void {
    for (const tool of tools) {
      this.register(tool)
    }
  }

  /**
   * Get all registered tools
   */
  getAllTools(): EnhancedTool[] {
    return Array.from(this.tools.values())
  }

  /**
   * Get tool by name
   */
  getTool(name: string): EnhancedTool | undefined {
    return this.tools.get(name)
  }

  /**
   * Partition tools into concurrent and serial batches
   * Claude Code pattern: concurrent-safe tools run together, unsafe tools serialize
   */
  partitionTools(tools: EnhancedTool[]): ToolBatch {
    const concurrent: EnhancedTool[] = []
    const serial: EnhancedTool[] = []

    for (const tool of tools) {
      if (tool.capabilities.concurrencySafe) {
        concurrent.push(tool)
      } else {
        serial.push(tool)
      }
    }

    return { concurrent, serial }
  }

  /**
   * Execute a single tool invocation
   */
  private async executeOne(
    request: ToolExecutionRequest,
  ): Promise<ToolExecutionResponse> {
    const { tool, invocationId, input, context } = request
    const startTime = Date.now()

    try {
      // Run pre-execution hooks
      const preResult = await this.runPreHooks(context, tool.name, input)
      if (!preResult.allowed) {
        return {
          invocationId,
          toolName: tool.name,
          result: {
            success: false,
            error: preResult.denyReason || 'Pre-execution check failed',
          },
          durationMs: Date.now() - startTime,
        }
      }

      // Use potentially modified input from hooks
      const finalInput = preResult.modifiedInput || input

      // Custom validation if tool provides it
      if (tool.validateInput) {
        const validation = await tool.validateInput(finalInput)
        if (!validation.isValid) {
          return {
            invocationId,
            toolName: tool.name,
            result: {
              success: false,
              error: validation.error || 'Input validation failed',
              warnings: validation.warnings,
            },
            durationMs: Date.now() - startTime,
          }
        }
      }

      // Execute the tool
      const result = await tool.tool.call(finalInput)

      const durationMs = Date.now() - startTime
      const toolResult: ToolResult = {
        success: true,
        data: result,
        durationMs,
        warnings: preResult.warnings,
      }

      // Run post-execution hooks
      await this.runPostHooks(context, tool.name, toolResult, durationMs)

      return {
        invocationId,
        toolName: tool.name,
        result: toolResult,
        durationMs,
      }
    } catch (error) {
      const durationMs = Date.now() - startTime
      const errorMessage =
        error instanceof Error ? error.message : 'Tool execution failed'

      const failedResult: ToolResult = {
        success: false,
        error: errorMessage,
        durationMs,
      }

      // Still run post hooks even on failure
      await this.runPostHooks(context, tool.name, failedResult, durationMs)

      return {
        invocationId,
        toolName: tool.name,
        result: failedResult,
        durationMs,
      }
    }
  }

  /**
   * Execute multiple tool requests with proper batching
   * Claude Code pattern: concurrent-safe in parallel, then serial
   */
  async executeBatch(
    requests: ToolExecutionRequest[],
    options: {
      onProgress?: (progress: ToolProgress) => void
      signal?: AbortSignal
    } = {},
  ): Promise<ToolExecutionResponse[]> {
    if (requests.length === 0) return []

    // Check permissions upfront
    for (const req of requests) {
      const hasPermission = await this.config.permissionChecker(
        req.tool.name,
        req.context.userId,
      )
      if (!hasPermission) {
        return [
          {
            invocationId: req.invocationId,
            toolName: req.tool.name,
            result: {
              success: false,
              error: `Permission denied for tool: ${req.tool.name}`,
            },
            durationMs: 0,
          },
        ]
      }
    }

    // Partition into concurrent and serial groups
    const batch = this.partitionTools(requests.map((r) => r.tool))

    const results: ToolExecutionResponse[] = []

    // 1. Execute concurrent tools (with concurrency limit)
    if (batch.concurrent.length > 0) {
      const concurrentResults = await this.executeConcurrent(
        requests.filter((r) => batch.concurrent.includes(r.tool)),
        options,
      )
      results.push(...concurrentResults)
    }

    // 2. Execute serial tools (one at a time, in order)
    if (batch.serial.length > 0) {
      const serialRequests = requests.filter((r) =>
        batch.serial.includes(r.tool),
      )
      for (const request of serialRequests) {
        if (options.signal?.aborted) {
          break
        }
        const result = await this.executeOne(request)
        results.push(result)
      }
    }

    return results
  }

  /**
   * Execute tools concurrently with limit
   */
  private async executeConcurrent(
    requests: ToolExecutionRequest[],
    options: { onProgress?: (p: ToolProgress) => void; signal?: AbortSignal },
  ): Promise<ToolExecutionResponse[]> {
    const semaphore = createSemaphore(this.config.maxConcurrency)
    const results: ToolExecutionResponse[] = []

    const tasks = requests.map(async (request) => {
      if (options.signal?.aborted) {
        return {
          invocationId: request.invocationId,
          toolName: request.tool.name,
          result: { success: false, error: 'Aborted' },
          durationMs: 0,
        }
      }

      await semaphore.acquire()
      try {
        const result = await this.executeOne(request)
        results.push(result)

        // Report progress if enabled
        if (this.config.enableProgressReporting && options.onProgress) {
          options.onProgress({
            message: `Completed ${request.tool.name}`,
            percent: Math.round((results.length / requests.length) * 100),
          })
        }

        return result
      } finally {
        semaphore.release()
      }
    })

    await Promise.all(tasks)
    return results
  }

  /**
   * Execute tools with full orchestration (main entry point)
   * Takes raw tool calls from LLM and executes them
   */
  async execute(
    rawToolCalls: Array<{
      id: string
      function: { name: string; arguments: string }
    }>,
    context: ToolExecutionContext,
    options: {
      onProgress?: (progress: ToolProgress) => void
      signal?: AbortSignal
    } = {},
  ): Promise<ToolExecutionResponse[]> {
    const requests: ToolExecutionRequest[] = []

    for (const toolCall of rawToolCalls) {
      const tool = this.tools.get(toolCall.function.name)
      if (!tool) {
        // Tool not found - return error result
        continue // Skip unknown tools (already handled upstream)
      }

      // Parse arguments
      let args: Record<string, unknown>
      try {
        args = JSON.parse(toolCall.function.arguments)
      } catch {
        // Invalid JSON - let tool handle it via validation
        args = { raw: toolCall.function.arguments }
      }

      const invocationId = toolCall.id
      const request: ToolExecutionRequest = {
        tool,
        invocationId,
        input: args,
        context: {
          ...context,
          invocationId,
          metadata: {
            ...context.metadata,
            toolName: tool.name,
          },
        },
      }

      requests.push(request)
    }

    return this.executeBatch(requests, options)
  }

  /**
   * Run pre-hooks for a single request (exposed for testing)
   */
  private async runPreHooks(
    ctx: ToolExecutionContext,
    toolName: string,
    input: Record<string, unknown>,
  ): Promise<PreToolUseResult> {
    return runPreHooks(this.config.preHooks, ctx, toolName, input)
  }

  /**
   * Run post-hooks for a single result
   */
  private async runPostHooks(
    ctx: ToolExecutionContext,
    toolName: string,
    result: ToolResult,
    durationMs: number,
  ): Promise<void> {
    await runPostHooks(this.config.postHooks, ctx, toolName, result, durationMs)
  }
}

/**
 * Semaphore for concurrency control
 */
function createSemaphore(max: number) {
  let counter = 0
  const waiting: Array<{ resolve: () => void; reject: (err: Error) => void }> =
    []

  return {
    async acquire(): Promise<void> {
      if (counter < max) {
        counter++
        return
      }
      return new Promise<void>((resolve, reject) => {
        waiting.push({ resolve, reject })
      })
    },
    release(): void {
      counter--
      if (waiting.length > 0) {
        counter++
        const next = waiting.shift()
        if (next) {
          setTimeout(() => next.resolve(), 0)
        }
      }
    },
  }
}

/**
 * Create a default orchestrator with standard hooks
 */
export function createDefaultOrchestrator(
  extraConfig?: Partial<ToolOrchestratorConfig>,
): ToolOrchestrator {
  return new ToolOrchestrator({
    maxConcurrency: 5,
    preHooks: [loggingPreHook, auditPreHook, sanitizeInputHook],
    postHooks: [loggingPostHook, metricsPostHook, cacheInvalidationHook],
    enableProgressReporting: true,
    ...extraConfig,
  })
}
