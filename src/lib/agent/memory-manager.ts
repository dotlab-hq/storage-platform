import { env } from 'cloudflare:workers'

/**
 * Memory Manager for agent persistent memory
 * Uses Cloudflare KV for long-term storage
 * Only active if API key has 'chat:memory' scope
 *
 * Key format: memory:{userId}:{threadId}
 * Value: AgentMemory object
 */

export interface MemoryEntry {
  facts: string[] // Learned facts about user/preferences
  context: Record<string, string> // Key-value context snippets
  lastUpdated: number
}

const MEMORY_PREFIX = 'memory'

export class MemoryManager {
  /**
   * Retrieve memory for a user+thread combination
   */
  static async get(
    userId: string,
    threadId: string,
  ): Promise<MemoryEntry | null> {
    const key = `${MEMORY_PREFIX}:${userId}:${threadId}`
    try {
      const raw = await env.KV.get(key, 'json')
      return (raw as MemoryEntry | null) || null
    } catch (error) {
      console.error('[Memory] Get error:', error)
      return null
    }
  }

  /**
   * Save/update memory for a user+thread
   */
  static async set(
    userId: string,
    threadId: string,
    memory: Partial<MemoryEntry>,
  ): Promise<void> {
    const key = `${MEMORY_PREFIX}:${userId}:${threadId}`

    // Get existing or use defaults
    const existing = await this.get(userId, threadId)
    const updated: MemoryEntry = {
      facts: existing?.facts || [],
      context: existing?.context || {},
      lastUpdated: Date.now(),
      ...memory,
    }

    try {
      await env.KV.put(key, JSON.stringify(updated), {
        expirationTtl: 60 * 60 * 24 * 30, // 30 days
      })
    } catch (error) {
      console.error('[Memory] Set error:', error)
    }
  }

  /**
   * Add a fact to memory (merge with existing)
   */
  static async addFact(
    userId: string,
    threadId: string,
    fact: string,
  ): Promise<void> {
    const existing = await this.get(userId, threadId)
    const facts = existing?.facts || []
    if (!facts.includes(fact)) {
      facts.push(fact)
      await this.set(userId, threadId, { facts })
    }
  }

  /**
   * Set a context key-value pair
   */
  static async setContext(
    userId: string,
    threadId: string,
    key: string,
    value: string,
  ): Promise<void> {
    const existing = await this.get(userId, threadId)
    const context = existing?.context || {}
    context[key] = value
    await this.set(userId, threadId, { context })
  }

  /**
   * Get formatted memory string for injection into LLM prompts
   */
  static async formatForPrompt(
    userId: string,
    threadId: string,
  ): Promise<string> {
    const memory = await this.get(userId, threadId)
    if (
      !memory ||
      (memory.facts.length === 0 && Object.keys(memory.context).length === 0)
    ) {
      return ''
    }

    let output = '=== Long-Term Memory ===\n'

    if (memory.context && Object.keys(memory.context).length > 0) {
      output += '\nContext:\n'
      for (const [k, v] of Object.entries(memory.context)) {
        output += `  ${k}: ${v}\n`
      }
    }

    if (memory.facts && memory.facts.length > 0) {
      output += '\nLearned Facts:\n'
      memory.facts.forEach((fact) => {
        output += `  - ${fact}\n`
      })
    }

    output += `\n_Last updated: ${new Date(memory.lastUpdated).toISOString()}_\n`
    output += '========================\n\n'

    return output
  }

  /**
   * Clear memory for a thread
   */
  static async clear(userId: string, threadId: string): Promise<void> {
    const key = `${MEMORY_PREFIX}:${userId}:${threadId}`
    try {
      await env.KV.delete(key)
    } catch (error) {
      console.error('[Memory] Clear error:', error)
    }
  }
}
