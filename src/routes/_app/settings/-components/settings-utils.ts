import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { account } from '@/db/schema/auth-schema'

export const ProfileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  image: z.string().trim().url().or(z.literal('')),
})

export const PasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
})

export const TwoFactorPasswordSchema = z.object({
  password: z.string().min(8),
})

export const VerifyTotpSchema = z.object({
  code: z.string().length(6, 'TOTP code must be 6 digits'),
})

export const toErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    if (/at least 8|minPasswordLength|password length/i.test(error.message)) {
      return 'Password must be at least 8 characters.'
    }
    return error.message
  }
  return fallback
}

export const hasPasswordCredential = async (
  userId: string,
): Promise<boolean> => {
  const credentialAccount = await db.query.account.findFirst({
    columns: { password: true },
    where: and(
      eq(account.userId, userId),
      eq(account.providerId, 'credential'),
    ),
  })
  return Boolean(credentialAccount?.password)
}
