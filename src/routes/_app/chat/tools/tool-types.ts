import type { ZodType } from 'zod'
import type { BaseMessage } from '@langchain/core/messages'
import type { StructuredTool } from '@langchain/core/tools'

/**
 * Execution context passed to hooks and tool execution
 */
export interface ToolExecutionContext {
  /** Unique identifier for this tool invocation */
  invocationId: string
  /** User ID making the request */
  userId: string
  /** Thread/chat ID */
  threadId: string
  /** Timestamp when invocation started */
  startedAt: Date
  /** Additional metadata (agent name, iteration, etc.) */
  metadata: Record<string, unknown>
}

/**
 * Progress update from a long-running tool
 */
export interface ToolProgress {
  /** Percentage complete (0-100) */
  percent?: number
  /** Human-readable status message */
  message: string
  /** Current step description */
  currentStep?: string
  /** Estimated time remaining in seconds */
  etaSeconds?: number
}

/**
 * Validation result for input validation phase
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
  /**
   * Modified/transformed input to use instead of raw input.
   * Pre-hooks can use this to adjust parameters (e.g., expand file globs,
   * add defaults, normalize paths) before execution.
   */
  transformedInput?: Record<string, unknown>
}

/**
 * Extended tool result with metadata
 */
export interface ToolResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  /** Duration of execution in milliseconds */
  durationMs?: number
  /** Warning messages (non-fatal issues) */
  warnings?: string[]
  /** Whether result was truncated (e.g., file too large) */
  truncated?: boolean
  /** Progress updates emitted during execution */
  progressUpdates?: ToolProgress[]
}

/**
 * Capability flags that describe what a tool can do
 */
export interface ToolCapabilities {
  /** Can execute concurrently with other tools */
  concurrencySafe: boolean
  /** Has no side effects (pure read operation) */
  readOnly: boolean
  /** Can be safely interrupted/cancelled mid-execution */
  interruptible: boolean
  /** Requires network access (affects offline mode) */
  requiresNetwork: boolean
  /** May take significant time (>5s) */
  longRunning: boolean
  /** Works with streaming data */
  streaming?: boolean
}

/**
 * Tool lifecycle hook function types
 */
export type PreToolUseHook = (
  ctx: ToolExecutionContext,
  toolName: string,
  input: Record<string, unknown>,
) => Promise<PreToolUseResult>

export type PostToolUseHook = (
  ctx: ToolExecutionContext,
  toolName: string,
  result: ToolResult,
  durationMs: number,
) => Promise<void>

/**
 * Result of a pre-tool use hook
 */
export interface PreToolUseResult {
  /** Allow execution to proceed */
  allowed: boolean
  /** Deny execution with this message */
  denyReason?: string
  /** Modified input to use instead of original */
  modifiedInput?: Record<string, unknown>
  /** Add warnings that will be shown to user */
  warnings?: string[]
}

/**
 * Configuration for the tool execution system
 */
export interface ToolOrchestratorConfig {
  /** Maximum concurrent tool executions (default: 5) */
  maxConcurrency?: number
  /** Maximum total iterations (tool call loops) */
  maxIterations?: number
  /** Pre-execution hooks to run */
  preHooks?: PreToolUseHook[]
  /** Post-execution hooks to run */
  postHooks?: PostToolUseHook[]
  /** Whether to collect progress updates */
  enableProgressReporting?: boolean
  /** Function to check if user has permission for a tool */
  permissionChecker?: (toolName: string, userId: string) => Promise<boolean>
}

/**
 * Batch of tools partitioned by concurrency safety
 */
export interface ToolBatch {
  /** Tools that can run concurrently */
  concurrent: EnhancedTool[]
  /** Tools that must run serially (in order) */
  serial: EnhancedTool[]
}

/**
 * Enhanced tool definition extending LangChain's StructuredTool
 * with metadata and lifecycle capabilities.
 */
export interface EnhancedTool extends Omit<
  StructuredTool,
  'name' | 'description' | 'schema'
> {
  /** Tool name (must be unique) */
  name: string
  /** One-line summary of what the tool does */
  description: string
  /** When to use this tool - concrete scenarios with examples */
  whenToUse?: string[]
  /** When NOT to use this tool - common misconceptions to avoid */
  whenNotToUse?: string[]
  /** Example invocations showing typical usage */
  examples?: Array<{
    description: string
    arguments: Record<string, unknown>
  }>
  /** Tool capabilities and flags */
  capabilities: ToolCapabilities
  /** Required permission scope (if any) */
  requiredScope?: string
  /** Execution context: server-only, client-only, or both */
  executionContext: 'server' | 'client' | 'both'
  /** Custom validation beyond Zod schema */
  validateInput?: (input: Record<string, unknown>) => Promise<ValidationResult>
  /** Pre-execution hook (modify input, check permissions) */
  onBeforeExecute?: (
    ctx: ToolExecutionContext,
    input: Record<string, unknown>,
  ) => Promise<PreToolUseResult>
  /** Post-execution hook (logging, cleanup) */
  onAfterExecute?: (
    ctx: ToolExecutionContext,
    result: ToolResult,
  ) => Promise<void>
  /** Progress callback for long-running operations */
  onProgress?: (ctx: ToolExecutionContext, progress: ToolProgress) => void
  /** Interruption behavior */
  interruptionBehavior?: 'cancel' | 'block' | 'graceful'
  /** The underlying StructuredTool instance */
  tool: StructuredTool
  /** Original Zod schema (for reference) */
  schema: ZodType<unknown>
}

/**
 * Tool execution request
 */
export interface ToolExecutionRequest {
  tool: EnhancedTool
  invocationId: string
  input: Record<string, unknown>
  context: ToolExecutionContext
}

/**
 * Tool execution response
 */
export interface ToolExecutionResponse<T = unknown> {
  invocationId: string
  toolName: string
  result: ToolResult<T>
  durationMs: number
}
