import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { admin } from 'better-auth/plugins/admin'
import { twoFactor } from 'better-auth/plugins/two-factor'
import { apiKey } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/db' // your drizzle instance
import { USER_ROLES } from '@/lib/authz'
import * as schema from '@/db/schema/auth-schema' // your drizzle schema
import { userStorage } from '@/db/schema/storage'
import {
  DEFAULT_ALLOCATED_STORAGE_BYTES,
  DEFAULT_FILE_SIZE_LIMIT_BYTES,
} from '@/lib/storage-quota-constants'
import { sendResetPasswordEmail } from '@/lib/email/send-reset-password-email'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: schema,
    debugLogs: process.env.NODE_ENV !== 'production',
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          await db
            .insert(userStorage)
            .values({
              userId: createdUser.id,
              allocatedStorage: DEFAULT_ALLOCATED_STORAGE_BYTES,
              fileSizeLimit: DEFAULT_FILE_SIZE_LIMIT_BYTES,
              usedStorage: 0,
            })
            .onConflictDoNothing({ target: userStorage.userId })
        },
      },
    },
  },
  appName: 'DOT Storage Platform',
  advanced: {
    cookies: {
      state: {
        attributes: {
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          secure: process.env.NODE_ENV === 'production',
        },
      },
    },
  },
  socialProviders: {
    github: {
      clientId: process.env._GITHUB_CLIENT_ID,
      clientSecret: process.env._GITHUB_CLIENT_SECRET,
    },
  },
  account: {
    accountLinking: {
      enabled: true,

      trustedProviders: ['github', 'email-password'],
      allowDifferentEmails: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      await sendResetPasswordEmail({
        to: user.email,
        resetUrl: url,
        token,
        recipientName: user.name,
        placement: 'top',
      })
    },
  },
  user: {
    additionalFields: {
      isAdmin: {
        type: 'boolean',
        defaultValue: false,
      },
    },
  },

  plugins: [
    tanstackStartCookies(),
    admin({
      defaultRole: USER_ROLES.user,
      adminRoles: [USER_ROLES.admin],
    }),
    twoFactor(),
    apiKey(),
  ],
})
