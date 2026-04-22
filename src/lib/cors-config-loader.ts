/**
 * @server
 * Server-only utility to load and manage CORS configuration from cors.json
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { CorsConfig } from './cors-validator'
import { validateCorsConfig } from './cors-validator'

let cachedCorsConfig: CorsConfig | null = null

/**
 * Load CORS configuration from cors.json file
 * Validates the configuration and caches it
 */
export async function loadCorsConfig(): Promise<CorsConfig> {
  if (cachedCorsConfig) {
    return cachedCorsConfig
  }

  try {
    const configPath = join(process.cwd(), 'cors.json')
    const fileContent = await readFile(configPath, 'utf-8')
    const config = JSON.parse(fileContent)

    const validation = validateCorsConfig(config)
    if (!validation.valid) {
      console.error('Invalid CORS configuration:', validation.errors)
      throw new Error('CORS configuration validation failed')
    }

    cachedCorsConfig = config as CorsConfig
    return cachedCorsConfig
  } catch (error) {
    console.error('Failed to load CORS configuration:', error)
    throw error
  }
}

/**
 * Get cached CORS configuration (must call loadCorsConfig first)
 */
export function getCachedCorsConfig(): CorsConfig | null {
  return cachedCorsConfig
}

/**
 * Reset the cached configuration (useful for testing)
 */
export function resetCorsConfigCache(): void {
  cachedCorsConfig = null
}
