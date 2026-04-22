/**
 * @client
 * Client-only validation utilities for CORS configuration
 * Safe to use in React components and client-side code
 */

import { z } from 'zod'

const CorsRuleSchema = z.object({
  AllowedOrigins: z
    .array(z.string().min(1))
    .min(1, 'At least one origin is required'),
  AllowedMethods: z
    .array(z.enum(['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS']))
    .min(1, 'At least one method is required'),
  AllowedHeaders: z.array(z.string()).optional().default(['*']),
  ExposeHeaders: z.array(z.string()).optional().default([]),
  MaxAgeSeconds: z.number().int().min(0).max(604800).optional().default(3600),
})

// Allow both PascalCase and lowercase field names
const CorsRuleLowercaseSchema = z.object({
  allowedOrigins: z
    .array(z.string().min(1))
    .min(1, 'At least one origin is required'),
  allowedMethods: z
    .array(z.enum(['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS']))
    .min(1, 'At least one method is required'),
  allowedHeaders: z.array(z.string()).optional().default(['*']),
  exposeHeaders: z.array(z.string()).optional().default([]),
  maxAgeSeconds: z.number().int().min(0).max(604800).optional().default(3600),
})

export const CorsConfigSchema = z.object({
  CORSRules: z
    .array(CorsRuleSchema)
    .min(1, 'At least one CORS rule is required'),
})

export const CorsConfigLowercaseSchema = z.object({
  CORSRules: z
    .array(CorsRuleLowercaseSchema)
    .min(1, 'At least one CORS rule is required'),
})

export type CorsRule = z.infer<typeof CorsRuleSchema>
export type CorsConfig = z.infer<typeof CorsConfigSchema>

/**
 * Client-only function to validate CORS configuration
 * @param config The CORS configuration to validate (accepts both PascalCase and lowercase field names)
 * @returns Validation result with errors if invalid
 */
export function validateCorsConfig(config: unknown): {
  valid: boolean
  errors?: Record<string, string[]>
} {
  // Try PascalCase first
  const pascalResult = CorsConfigSchema.safeParse(config)

  if (pascalResult.success) {
    return { valid: true }
  }

  // If that fails, try lowercase
  const lowercaseResult = CorsConfigLowercaseSchema.safeParse(config)

  if (lowercaseResult.success) {
    return { valid: true }
  }

  // Return errors from the PascalCase schema (primary format)
  const errors: Record<string, string[]> = {}
  pascalResult.error.issues.forEach((error) => {
    const path = error.path.join('.') || 'root'
    errors[path] = (errors[path] ?? []).concat(error.message)
  })

  return { valid: false, errors }
}

/**
 * Get default CORS configuration that allows all origins
 * Defaults to minimal required methods: GET, PUT, HEAD
 */
export function getDefaultCorsConfig(): CorsConfig {
  return {
    CORSRules: [
      {
        AllowedOrigins: ['*'],
        AllowedMethods: ['PUT', 'GET', 'HEAD'],
        AllowedHeaders: ['*'],
        ExposeHeaders: ['ETag'],
        MaxAgeSeconds: 3000,
      },
    ],
  }
}

/**
 * Convert database JSON format to CorsConfig format
 * Database stores each field as separate JSON columns
 */
export function convertDatabaseToCorsConfig(
  rules: Array<{
    allowedOriginsJson: string
    allowedMethodsJson: string
    allowedHeadersJson?: string | null
    exposeHeadersJson?: string | null
    maxAgeSeconds?: number | null
  }>,
): CorsConfig {
  return {
    CORSRules: rules.map((rule) => ({
      AllowedOrigins: JSON.parse(rule.allowedOriginsJson),
      AllowedMethods: JSON.parse(rule.allowedMethodsJson),
      AllowedHeaders: rule.allowedHeadersJson
        ? JSON.parse(rule.allowedHeadersJson)
        : ['*'],
      ExposeHeaders: rule.exposeHeadersJson
        ? JSON.parse(rule.exposeHeadersJson)
        : [],
      MaxAgeSeconds: rule.maxAgeSeconds ?? 3600,
    })),
  }
}

/**
 * Convert CorsConfig format to database JSON format
 */
export function convertCorsConfigToDatabase(config: CorsConfig): Array<{
  allowedOriginsJson: string
  allowedMethodsJson: string
  allowedHeadersJson: string
  exposeHeadersJson: string
  maxAgeSeconds: number
}> {
  return config.CORSRules.map((rule) => ({
    allowedOriginsJson: JSON.stringify(rule.AllowedOrigins),
    allowedMethodsJson: JSON.stringify(rule.AllowedMethods),
    allowedHeadersJson: JSON.stringify(rule.AllowedHeaders),
    exposeHeadersJson: JSON.stringify(rule.ExposeHeaders),
    maxAgeSeconds: rule.MaxAgeSeconds,
  }))
}
