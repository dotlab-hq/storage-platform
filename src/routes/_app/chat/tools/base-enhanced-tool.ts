import { StructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import type {
  EnhancedTool,
  ToolCapabilities,
  ToolExecutionContext,
  ToolResult,
  ValidationResult,
  PreToolUseResult,
  ToolProgress,
} from './tool-types'

/**
 * Base class for creating enhanced tools with metadata and hooks
 * Extends LangChain's StructuredTool with production features
 *
 * Usage:
 * ```typescript
 * export class ListFilesTool extends BaseEnhancedTool {
 *   name = 'list_files'
 *   description = 'List files in a bucket'
 *
 *   schema = z.object({
 *     bucket: z.string(),
 *     prefix: z.string().optional(),
 *   })
 *
 *   capabilities = {
 *     concurrencySafe: true,
 *     readOnly: true,
 *     interruptible: true,
 *     requiresNetwork: false,
 *     longRunning: false,
 *   }
 *
 *   async execute(input, context) {
 *     // Your implementation
 *     return { files: [...] }
 *   }
 * }
 * ```
 */
export abstract class BaseEnhancedTool extends StructuredTool {
  // Abstract properties that subclasses must define
  abstract name: string
  abstract description: string
  abstract schema: z.ZodObject<z.ZodRawShape>
  abstract capabilities: ToolCapabilities

  // Optional metadata
  whenToUse?: string[] = []
  whenNotToUse?: string[] = []
  examples?: Array<{ description: string; arguments: Record<string, unknown> }> = []
  requiredScope?: string
  executionContext: 'server' | 'client' | 'both' = 'server'
  interruptionBehavior: 'cancel' | 'block' | 'graceful' = 'cancel'

  // Optional hooks
  validateInput?: ( input: Record<string, unknown> ) => Promise<ValidationResult>
  onBeforeExecute?: ( ctx: ToolExecutionContext, input: Record<string, unknown> ) => Promise<PreToolUseResult>
  onAfterExecute?: ( ctx: ToolExecutionContext, result: ToolResult ) => Promise<void>
  onProgress?: ( ctx: ToolExecutionContext, progress: ToolProgress ) => void

  // cached schema for type safety
  private _schema: z.ZodType<unknown>

  constructor() {
    super()
    this._schema = this.schema as z.ZodType<unknown>
  }

  /**
   * Main execution method - override this in subclasses
   */
  protected abstract execute(
    input: z.infer<typeof this.schema>,
    context: ToolExecutionContext,
  ): Promise<unknown>

  /**
   * Get full tool description for LLM context
   * Includes usage examples and guidance
   */
  getFullDescription(): string {
    let desc = `${this.name}: ${this.description}\n\n`

    if ( this.whenToUse && this.whenToUse.length > 0 ) {
      desc += `When to use:\n${this.whenToUse.map( ( s ) => `  - ${s}` ).join( '\n' )}\n\n`
    }

    if ( this.whenNotToUse && this.whenNotToUse.length > 0 ) {
      desc += `When NOT to use:\n${this.whenNotToUse.map( ( s ) => `  - ${s}` ).join( '\n' )}\n\n`
    }

    if ( this.examples && this.examples.length > 0 ) {
      desc += `Examples:\n`
      for ( const ex of this.examples ) {
        desc += `  ${ex.description}:\n    ${JSON.stringify( ex.arguments )}\n`
      }
      desc += '\n'
    }

    desc += `Capabilities: ${Object.entries( this.capabilities )
      .map( ( [k, v] ) => `${k}: ${v}` )
      .join( ', ' )}`

    return desc
  }

  // --- StructuredTool interface implementation ---

  /**
   * LangChain calls this - we adapt to our execute() method
   */
  async _call( input: Record<string, unknown> ): Promise<string> {
    // This is the synchronous call interface used by LangChain
    // We'll wrap execute() and convert result to string
    const ctx: ToolExecutionContext = {
      invocationId: '',
      userId: 'unknown',
      threadId: '',
      startedAt: new Date(),
      metadata: {},
    }

    try {
      const result = await this.execute( input as z.infer<typeof this.schema>, ctx )
      return typeof result === 'string' ? result : JSON.stringify( result, null, 2 )
    } catch ( error ) {
      throw error
    }
  }

  /**
   * Get the Zod schema for LangChain integration
   */
  get schema(): z.ZodType<unknown> {
    return this._schema
  }

  /**
   * Set schema (for constructor)
   */
  set schema( value: z.ZodObject<z.ZodRawShape> ) {
    this._schema = value as z.ZodType<unknown>
  }

  /**
   * Convert to EnhancedTool for orchestrator
   */
  toEnhancedTool(): EnhancedTool {
    return {
      ...this,
      tool: this,
      schema: this._schema,
    } as EnhancedTool
  }
}

/**
 * Helper to convert a StructuredTool to EnhancedTool with default metadata
 */
export function enhanceTool(
  tool: StructuredTool,
  overrides: Partial<EnhancedTool> = {},
): EnhancedTool {
  const structuredTool = tool as StructuredTool & {
    schema?: z.ZodType<unknown>
  }
  const capabilities: ToolCapabilities = {
    concurrencySafe: overrides.capabilities?.concurrencySafe ?? true,
    readOnly: overrides.capabilities?.readOnly ?? false,
    interruptible: overrides.capabilities?.interruptible ?? true,
    requiresNetwork: overrides.capabilities?.requiresNetwork ?? false,
    longRunning: overrides.capabilities?.longRunning ?? false,
    streaming: overrides.capabilities?.streaming,
  }

  return {
    name: tool.name,
    description: overrides.description ?? tool.description,
    whenToUse: overrides.whenToUse,
    whenNotToUse: overrides.whenNotToUse,
    examples: overrides.examples,
    capabilities: overrides.capabilities ?? capabilities,
    requiredScope: overrides.requiredScope,
    executionContext: overrides.executionContext ?? 'server',
    interruptionBehavior: overrides.interruptionBehavior ?? 'cancel',
    validateInput: overrides.validateInput,
    onBeforeExecute: overrides.onBeforeExecute,
    onAfterExecute: overrides.onAfterExecute,
    onProgress: overrides.onProgress,
    tool,
    schema: structuredTool.schema ?? z.unknown(),
    // Spread remaining StructuredTool properties
    ...tool,
  } as EnhancedTool
}

/**
 * Convenience wrapper: if tool already looks enhanced, return as-is; otherwise enhance.
 * This is useful when registering tools that may or may not already be EnhancedTool instances.
 */
export function enhanceToolIfNeeded( tool: StructuredTool ): EnhancedTool {
  // Check if tool already has enhanced properties
  if ( 'capabilities' in tool && tool.capabilities ) {
    return tool as EnhancedTool
  }
  return enhanceTool( tool )
}

/**
 * Alias for backward compatibility. Use enhanceToolIfNeeded instead.
 */
export const enhanceToolWithHeuristics = enhanceToolIfNeeded

/**
 * Decorator to add enhanced metadata to a tool class
 * Usage:
 * ```typescript
 * @EnhancedTool({
 *   whenToUse: ['Use when you need to...'],
 *   examples: [{ arguments: { bucket: 'my-bucket' } }]
 * })
 * export class ListFilesTool extends BaseEnhancedTool { ... }
 * ```
 */
export function EnhancedTool( metadata: Partial<EnhancedTool> ) {
  return function <T extends new ( ...args: unknown[] ) => BaseEnhancedTool>(
    constructor: T,
  ): T {
    return class extends constructor {
      name = metadata.name ?? this.name
      description = metadata.description ?? this.description
      whenToUse = metadata.whenToUse ?? []
      whenNotToUse = metadata.whenNotToUse ?? []
      examples = metadata.examples ?? []
      capabilities = metadata.capabilities ?? {
        concurrencySafe: true,
        readOnly: false,
        interruptible: true,
        requiresNetwork: false,
        longRunning: false,
      }
      requiredScope = metadata.requiredScope
      executionContext = metadata.executionContext ?? 'server'
      interruptionBehavior = metadata.interruptionBehavior ?? 'cancel'
    }
  }
}
