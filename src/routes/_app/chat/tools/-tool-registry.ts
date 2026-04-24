import { StructuredTool } from '@langchain/core/tools'
import { MATH_TOOLS } from './-math-tools'

type ToolMap = Record<string, StructuredTool>

const toolMap: ToolMap = {}
for (const tool of MATH_TOOLS) {
  toolMap[tool.name] = tool
}

/**
 * Get all available tools
 */
export function getAllTools(): StructuredTool[] {
  return [...MATH_TOOLS]
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
