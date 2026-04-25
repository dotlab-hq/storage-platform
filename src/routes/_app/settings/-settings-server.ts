import { createServerFn } from '@tanstack/react-start'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { loadAuth } from '@/lib/auth-loader'
import { db } from '@/db'
import { account, apikey } from '@/db/schema/auth-schema'
import { getRequest } from '@tanstack/react-start/server'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getAllScopes } from '@/lib/permissions/scopes'
import type { ApiScope } from '@/lib/permissions/scopes'

const ALL_SCOPES = getAllScopes() as readonly ApiScope[]

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
  code: z.string().length(6, 'TOTP code must be 6 digits'),
})

const ApiKeySchema = z.object({
  name: z.string().trim().min(1).max(60),
  scopes: z
    .array(z.enum(ALL_SCOPES))
    .min(1, 'At least one scope must be selected')
    .max(20, 'Maximum 20 scopes allowed'),
})

const UpdateApiKeySchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(60).optional(),
  scopes: z
    .array(z.enum(ALL_SCOPES))
    .min(1, 'At least one scope must be selected')
    .max(20, 'Maximum 20 scopes allowed')
    .optional(),
})

const DeleteKeySchema = z.object({
  id: z.string(),
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

const bytesToBase64Url = (bytes: Uint8Array): string => {
  const base64 = Buffer.from(bytes).toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
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

const hasChatScope = (permissions: string | null): boolean => {
  if (!permissions) {
    return false
  }

  try {
    const parsed = JSON.parse(permissions) as unknown
    if (!Array.isArray(parsed)) {
      return false
    }

    return parsed.some(
      (value): value is string =>
        typeof value === 'string' && value === 'chat:completions',
    )
  } catch {
    return false
  }
}

export const getSettingsSnapshotFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const currentUser = await getAuthenticatedUser()
    const auth = await loadAuth()
    const request = getRequest()
    const headers = request.headers
    const [session, methods, apiKeys] = await Promise.all([
      auth.api.getSession({ headers }),
      auth.api.listUserAccounts({ headers }).catch((error: unknown) => {
        console.error('[settings] listUserAccounts failed', error)
        return [] as AuthAccountMethod[]
      }),
      db.query.apikey.findMany({
        where: eq(apikey.userId, currentUser.id),
        orderBy: (apiKeyRow, { desc }) => [desc(apiKeyRow.createdAt)],
      }),
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
      apiKeys: apiKeys
        .filter((key) => hasChatScope(key.permissions))
        .map((key) => {
          let scopes: string[] = []
          if (key.permissions) {
            try {
              scopes = JSON.parse(key.permissions)
            } catch {
              scopes = []
            }
          }
          return {
            id: key.id,
            name: key.name?.trim() || 'Chat API Key',
            keyPreview: key.key.slice(0, 8),
            status: key.enabled === false ? 'revoked' : 'active',
            scopes,
            createdAt: key.createdAt,
          }
        }),
      tinySessions: {
        active: [],
        recent: [],
      },
    }
  },
)

export const updateProfileSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator(ProfileSchema)
  .handler(async ({ data }) => {
    await getAuthenticatedUser()
    const auth = await loadAuth()
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
    const auth = await loadAuth()
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
    const auth = await loadAuth()
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
    const auth = await loadAuth()
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
    const auth = await loadAuth()
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

export const createChatApiKeyFn = createServerFn({ method: 'POST' })
  .inputValidator(ApiKeySchema)
  .handler(async ({ data }) => {
    const currentUser = await getAuthenticatedUser()

    const randomBytes = crypto.getRandomValues(new Uint8Array(32))
    const tokenBody = bytesToBase64Url(randomBytes)
    const token = `sp_chat_${tokenBody}`
    const now = new Date()

    await db.insert(apikey).values({
      id: crypto.randomUUID(),
      name: data.name,
      start: token.slice(0, 8),
      prefix: 'sp_chat',
      key: token,
      userId: currentUser.id,
      enabled: true,
      rateLimitEnabled: true,
      rateLimitTimeWindow: 60_000,
      rateLimitMax: 120,
      requestCount: 0,
      remaining: 120,
      permissions: JSON.stringify(data.scopes),
      metadata: JSON.stringify({ usage: 'chat-completions' }),
      createdAt: now,
      updatedAt: now,
    })

    return {
      success: true,
      apiKey: {
        key: token,
      },
    }
  })

export const deleteChatApiKeyFn = createServerFn({ method: 'POST' })
  .inputValidator(DeleteKeySchema)
  .handler(async ({ data }) => {
    const currentUser = await getAuthenticatedUser()

    const result = await db
      .delete(apikey)
      .where(and(eq(apikey.id, data.id), eq(apikey.userId, currentUser.id)))
      .returning()

    if (result.length === 0) {
      throw new Error('API Key not found or unauthorized')
    }

    return { success: true }
  })

export const updateChatApiKeyFn = createServerFn({ method: 'POST' })
  .inputValidator(UpdateApiKeySchema)
  .handler(async ({ data }) => {
    const currentUser = await getAuthenticatedUser()

    // Build update values
    const updateValues: any = { updatedAt: new Date() }
    if (data.name !== undefined) {
      updateValues.name = data.name.trim()
    }
    if (data.scopes !== undefined) {
      updateValues.permissions = JSON.stringify(data.scopes)
    }

    const result = await db
      .update(apikey)
      .set(updateValues)
      .where(and(eq(apikey.id, data.id), eq(apikey.userId, currentUser.id)))
      .returning()

    if (result.length === 0) {
      throw new Error('API Key not found or unauthorized')
    }

    let scopes: string[] = []
    if (result[0].permissions) {
      try {
        scopes = JSON.parse(result[0].permissions)
      } catch {
        scopes = []
      }
    }

    return {
      success: true,
      apiKey: {
        id: result[0].id,
        name: result[0].name,
        scopes,
      },
    }
  })
