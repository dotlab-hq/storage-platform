import { auth } from '@/lib/auth'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { db } from '@/db'
import { account, tinySession } from '@/db/schema/auth-schema'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, desc, eq, gt, isNull } from 'drizzle-orm'
import { z } from 'zod'

const ProfileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  image: z.string().trim().url().or(z.literal('')),
})

const PasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
})

const TwoFactorPasswordSchema = z.object({
  password: z.string().min(8),
})

const VerifyTotpSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/),
})

type AuthAccountMethod = {
  id: string
  providerId: string
  accountId: string
  createdAt: Date
}

type SessionUserWith2FA = {
  image?: string | null
  twoFactorEnabled?: boolean
}

const toErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    if (/at least 8|minPasswordLength|password length/i.test(error.message)) {
      return 'Password must be at least 8 characters.'
    }
    return error.message
  }
  return fallback
}

const hasPasswordCredential = async (userId: string): Promise<boolean> => {
  const credentialAccount = await db.query.account.findFirst({
    columns: { password: true },
    where: and(
      eq(account.userId, userId),
      eq(account.providerId, 'credential'),
    ),
  })
  return Boolean(credentialAccount?.password)
}

export const getSettingsSnapshotFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const currentUser = await getAuthenticatedUser()
    const request = getRequest()
    const headers = request.headers
    const now = new Date()
    const [session, methods, activeTinySessions, expiredTinySessions] =
      await Promise.all([
        auth.api.getSession({ headers }),
        auth.api.listUserAccounts({ headers }).catch((error: unknown) => {
          console.error('[settings] listUserAccounts failed', error)
          return [] as AuthAccountMethod[]
        }),
        db
          .select({
            id: tinySession.id,
            permission: tinySession.permission,
            createdAt: tinySession.createdAt,
            expiresAt: tinySession.expiresAt,
            lastUsedAt: tinySession.lastUsedAt,
            revokedAt: tinySession.revokedAt,
          })
          .from(tinySession)
          .where(
            and(
              eq(tinySession.userId, currentUser.id),
              isNull(tinySession.revokedAt),
              gt(tinySession.expiresAt, now),
            ),
          )
          .orderBy(desc(tinySession.createdAt))
          .limit(10),
        db
          .select({
            id: tinySession.id,
            permission: tinySession.permission,
            createdAt: tinySession.createdAt,
            expiresAt: tinySession.expiresAt,
            lastUsedAt: tinySession.lastUsedAt,
            revokedAt: tinySession.revokedAt,
          })
          .from(tinySession)
          .where(eq(tinySession.userId, currentUser.id))
          .orderBy(desc(tinySession.createdAt))
          .limit(30),
      ])
    if (!session?.user) throw new Error('Unauthorized')
    const sessionUser = session.user as SessionUserWith2FA
    const twoFactorEnabled = Boolean(sessionUser.twoFactorEnabled)
    return {
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        image: session.user.image ?? '',
        role: currentUser.role,
      },
      security: {
        twoFactorEnabled,
        passkeysSupported: false,
      },
      methods: methods.map((method) => ({
        id: method.id,
        providerId: method.providerId,
        accountId: method.accountId,
        createdAt: method.createdAt,
      })),
      tinySessions: {
        active: activeTinySessions,
        recent: expiredTinySessions,
      },
    }
  },
)

export const updateProfileSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator(ProfileSchema)
  .handler(async ({ data }) => {
    await getAuthenticatedUser()
    const request = getRequest()
    const headers = request.headers
    try {
      await auth.api.updateUser({
        headers,
        body: {
          name: data.name,
          image: data.image.trim() ? data.image.trim() : null,
        },
      })
      return { success: true, message: 'Profile updated.' }
    } catch (error) {
      throw new Error(toErrorMessage(error, 'Failed to update profile.'))
    }
  })

export const changePasswordSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator(PasswordSchema)
  .handler(async ({ data }) => {
    const currentUser = await getAuthenticatedUser()
    const request = getRequest()
    const headers = request.headers
    try {
      const hasPassword = await hasPasswordCredential(currentUser.id)
      if (hasPassword) {
        if (!data.currentPassword?.trim()) {
          throw new Error('Current password is required.')
        }
        await auth.api.changePassword({
          headers,
          body: {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
            revokeOtherSessions: true,
          },
        })
      } else {
        await auth.api.setPassword({
          headers,
          body: { newPassword: data.newPassword },
        })
      }
      return { success: true, message: 'Password updated.' }
    } catch (error) {
      throw new Error(toErrorMessage(error, 'Failed to update password.'))
    }
  })

export const enableTwoFactorSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator(TwoFactorPasswordSchema)
  .handler(async ({ data }) => {
    await getAuthenticatedUser()
    const request = getRequest()
    const headers = request.headers
    try {
      return await auth.api.enableTwoFactor({
        headers,
        body: {
          password: data.password,
          issuer: 'DOT Storage Platform',
        },
      })
    } catch (error) {
      throw new Error(toErrorMessage(error, 'Failed to enable 2FA.'))
    }
  })

export const verifyTwoFactorSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator(VerifyTotpSchema)
  .handler(async ({ data }) => {
    await getAuthenticatedUser()
    const request = getRequest()
    const headers = request.headers
    try {
      await auth.api.verifyTOTP({ headers, body: { code: data.code } })
      return { success: true, message: '2FA verified and enabled.' }
    } catch (error) {
      throw new Error(toErrorMessage(error, 'Failed to verify 2FA code.'))
    }
  })

export const disableTwoFactorSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator(TwoFactorPasswordSchema)
  .handler(async ({ data }) => {
    await getAuthenticatedUser()
    const request = getRequest()
    const headers = request.headers
    try {
      await auth.api.disableTwoFactor({
        headers,
        body: { password: data.password },
      })
      return { success: true, message: '2FA disabled.' }
    } catch (error) {
      throw new Error(toErrorMessage(error, 'Failed to disable 2FA.'))
    }
  })

export const rotateBackupCodesSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator(TwoFactorPasswordSchema)
  .handler(async ({ data }) => {
    await getAuthenticatedUser()
    const request = getRequest()
    const headers = request.headers
    try {
      return await auth.api.generateBackupCodes({
        headers,
        body: { password: data.password },
      })
    } catch (error) {
      throw new Error(toErrorMessage(error, 'Failed to rotate backup codes.'))
    }
  })
