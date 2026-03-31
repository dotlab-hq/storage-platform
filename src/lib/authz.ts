export const USER_ROLES = {
  user: "user",
  admin: "admin",
} as const

export type UserRole = ( typeof USER_ROLES )[keyof typeof USER_ROLES]

/**
 * Defaults every non-admin role (including null/undefined) to the least-privileged role.
 */
export function normalizeUserRole( role: string | null | undefined ): UserRole {
  return role === USER_ROLES.admin ? USER_ROLES.admin : USER_ROLES.user
}

export function isAdminRole( role: UserRole ): boolean {
  return role === USER_ROLES.admin
}
