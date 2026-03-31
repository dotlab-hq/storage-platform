export const USER_ROLES = {
  user: "user",
  admin: "admin",
} as const

export type UserRole = ( typeof USER_ROLES )[keyof typeof USER_ROLES]

export function normalizeUserRole( role: string | null | undefined ): UserRole {
  return role === USER_ROLES.admin ? USER_ROLES.admin : USER_ROLES.user
}

export function isAdminRole( role: UserRole ): boolean {
  return role === USER_ROLES.admin
}
