import type { StructuredTool } from '@langchain/core/tools'
import { createWorkerNode } from '../orchestration/supervisor-graph'
import { storageTools } from '@/routes/_app/chat/tools/-tool-registry'

/**
 * Storage Agent
 * Tools: file read/write/list/delete/search, bucket ops
 * Requires API key scope: chat:tool:storage
 */
export class StorageAgent {
  name = 'storage_agent'
  description = 'File storage operations: read, write, list, search, delete'

  getTools(): StructuredTool[] {
    return storageTools.map((t) => t.tool)
  }

  createNode() {
    return createWorkerNode(this.name, this.getTools())
  }
}

export const storageAgent = new StorageAgent()
