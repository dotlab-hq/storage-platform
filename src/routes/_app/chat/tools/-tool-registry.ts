import { StructuredTool } from '@langchain/core/tools'
import { MATH_TOOLS } from './-math-tools'
import { ENHANCED_STORAGE_TOOLS } from './enhanced-storage-tools'

type ToolMap = Record<string, StructuredTool>

const toolMap: ToolMap = {}

// Register math tools
for (const tool of MATH_TOOLS) {
  toolMap[tool.name] = tool
}

// Register storage tools
for (const tool of ENHANCED_STORAGE_TOOLS) {
  toolMap[tool.name] = tool
}

// Re-export MATH_TOOLS as mathTools for compatibility
export const mathTools = MATH_TOOLS

export { ENHANCED_STORAGE_TOOLS as storageTools }

/**
 * Get all available tools
 */
export function getAllTools(): StructuredTool[] {
  return [...MATH_TOOLS, ...ENHANCED_STORAGE_TOOLS]
}

/**
 * Get specific tools by name
 */
export function getToolsByName(names: string[]): StructuredTool[] {
  return names
    .map((name) => toolMap[name])
    .filter((tool): tool is StructuredTool => tool !== undefined)
}

/**
 * Get a single tool by name
 */
export function getTool(name: string): StructuredTool | undefined {
  return toolMap[name]
}

/**
 * Get tool names for system prompt
 */
export function getToolNames(): string[] {
  return Object.keys(toolMap)
}
