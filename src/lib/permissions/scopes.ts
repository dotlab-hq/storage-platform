/**
 * API Scopes/Permissions for API Keys
 * Format: resource:action
 */

export const API_SCOPES = {
  // Chat Completions
  CHAT_COMPLETIONS: 'chat:completions',

  // Chat Tools - Web Search
  CHAT_TOOL_WEB: 'chat:tool:web',

  // Chat Tools - Storage Operations
  CHAT_TOOL_STORAGE: 'chat:tool:storage',

  // Chat Memory - Long-term persistent memory
  CHAT_MEMORY: 'chat:memory',

  // Files - CRUD operations
  FILES_READ: 'files:read',
  FILES_WRITE: 'files:write',
  FILES_DELETE: 'files:delete',
  FILES_FULL: 'files:full',

  // Folders - CRUD operations
  FOLDERS_READ: 'folders:read',
  FOLDERS_WRITE: 'folders:write',
  FOLDERS_DELETE: 'folders:delete',
  FOLDERS_FULL: 'folders:full',

  // Storage Providers - management
  PROVIDERS_READ: 'providers:read',
  PROVIDERS_WRITE: 'providers:write',

  // S3 Bucket Operations
  BUCKETS_READ: 'buckets:read',
  BUCKETS_WRITE: 'buckets:write',
  BUCKETS_POLICY: 'buckets:policy',
  BUCKETS_ACL: 'buckets:acl',
  S3_FULL: 's3:full',

  // Share Links
  SHARE_CREATE: 'share:create',
  SHARE_READ: 'share:read',
  SHARE_DELETE: 'share:delete',

  // Activity/Logs
  ACTIVITY_READ: 'activity:read',

  // Admin - user management
  ADMIN_USERS_READ: 'admin:users:read',
  ADMIN_USERS_WRITE: 'admin:users:write',
  ADMIN_SYSTEM: 'admin:system',
} as const

export type ApiScope = (typeof API_SCOPES)[keyof typeof API_SCOPES]

/**
 * Check if a permissions array (stored as JSON string) contains a required scope
 */
export function hasScope(
  permissions: string | null,
  requiredScope: ApiScope,
): boolean {
  if (!permissions) return false
  try {
    const parsed = JSON.parse(permissions) as string[]
    return Array.isArray(parsed) && parsed.includes(requiredScope)
  } catch {
    return false
  }
}

/**
 * Check if a permissions array contains all required scopes
 */
export function hasAllScopes(
  permissions: string | null,
  requiredScopes: ApiScope[],
): boolean {
  if (!permissions) return false
  try {
    const parsed = JSON.parse(permissions) as string[]
    return (
      Array.isArray(parsed) &&
      requiredScopes.every((scope) => parsed.includes(scope))
    )
  } catch {
    return false
  }
}

/**
 * Get all available scopes as array of strings
 */
export function getAllScopes(): ApiScope[] {
  return Object.values(API_SCOPES) as ApiScope[]
}

/**
 * Get scope display name (user-friendly)
 */
export function getScopeDisplayName(scope: ApiScope): string {
  const names: Record<ApiScope, string> = {
    'chat:completions': 'Chat Completions',
    'chat:tool:web': 'Web Search Tool',
    'chat:tool:storage': 'Storage Operations Tool',
    'chat:memory': 'Long-term Memory',
    'files:read': 'Read Files',
    'files:write': 'Write Files',
    'files:delete': 'Delete Files',
    'files:full': 'Full File Access',
    'folders:read': 'Read Folders',
    'folders:write': 'Write Folders',
    'folders:delete': 'Delete Folders',
    'folders:full': 'Full Folder Access',
    'providers:read': 'Read Providers',
    'providers:write': 'Write Providers',
    'buckets:read': 'Read Buckets',
    'buckets:write': 'Write Buckets',
    'buckets:policy': 'Bucket Policies',
    'buckets:acl': 'Bucket ACLs',
    's3:full': 'Full S3 Access',
    'share:create': 'Create Shares',
    'share:read': 'Read Shares',
    'share:delete': 'Delete Shares',
    'activity:read': 'Read Activity',
    'admin:users:read': 'Read Users',
    'admin:users:write': 'Manage Users',
    'admin:system': 'System Admin',
  }
  return names[scope] || scope
}
