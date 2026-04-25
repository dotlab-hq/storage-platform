import type { StructuredTool } from '@langchain/core/tools'
import { mathTools } from './-math-tools'
import { TAVILY_TOOL } from './-tavily-search'
import { ENHANCED_STORAGE_TOOLS } from './-enhanced-storage-tools'
import type { ApiScope } from '@/lib/permissions/scopes'
import { hasAllScopes } from '@/lib/permissions/scopes'

/**
 * Tool registry with scope-based filtering
 *
 * Tools are organized by required scopes:
 * - math tools: no scope required (available to all)
 * - tavily_search: requires chat:tool:web
 * - storage tools: require chat:tool:storage
 * - memory tools: require chat:memory
 */

type ToolDefinition = {
  tool: StructuredTool
  scopes: ApiScope[]
  category: 'basic' | 'web' | 'storage' | 'memory'
}

const TOOL_REGISTRY: ToolDefinition[] = [
  // Basic tools (no special scope)
  ...mathTools.map((t) => ({
    tool: t,
    scopes: [] as ApiScope[],
    category: 'basic',
  })),
  // Web search (requires chat:tool:web)
  {
    tool: TAVILY_TOOL,
    scopes: ['chat:tool:web'] as ApiScope[],
    category: 'web',
  },
  // Storage tools (require chat:tool:storage)
  ...ENHANCED_STORAGE_TOOLS.map((t) => ({
    tool: t,
    scopes: ['chat:tool:storage'] as ApiScope[],
    category: 'storage',
  })),
]

/**
 * Get all tools, filtered by user's permissions
 */
export function getFilteredTools(permissions: string | null): StructuredTool[] {
  return TOOL_REGISTRY.filter((def) => {
    if (def.scopes.length === 0) return true // basic tools always included
    return hasAllScopes(permissions, def.scopes)
  }).map((def) => def.tool)
}

/**
 * Get all available tools (unfiltered)
 */
export function getAllAvailableTools(): StructuredTool[] {
  return TOOL_REGISTRY.map((def) => def.tool)
}

/**
 * Get tool definitions by category (for UI/debugging)
 */
export function getToolsByCategory() {
  return TOOL_REGISTRY.reduce(
    (acc, def) => {
      if (!acc[def.category]) acc[def.category] = []
      acc[def.category].push(def.tool.name)
      return acc
    },
    {} as Record<string, string[]>,
  )
}

/**
 * Check if user has access to a specific tool
 */
export function hasToolAccess(
  toolName: string,
  permissions: string | null,
): boolean {
  const toolDef = TOOL_REGISTRY.find((t) => t.tool.name === toolName)
  if (!toolDef) return false
  if (toolDef.scopes.length === 0) return true
  return hasAllScopes(permissions, toolDef.scopes)
}

/**
 * Get tools available to a specific permissions set
 */
export function getToolsForPermissions(permissions: string | null): string[] {
  return TOOL_REGISTRY.filter(
    (def) => def.scopes.length === 0 || hasAllScopes(permissions, def.scopes),
  ).map((def) => def.tool.name)
}
