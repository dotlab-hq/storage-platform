'use server'

import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { and, desc, eq, gt } from 'drizzle-orm'
import { apiAuthMiddleware } from '@/middlewares/api-auth'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { session as authSession, user } from '@/db/schema/auth-schema'

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

const sessionColumns = {
  id: authSession.id,
  expiresAt: authSession.expiresAt,
  createdAt: authSession.createdAt,
  ipAddress: authSession.ipAddress,
  userAgent: authSession.userAgent,
}

/** Everything the Settings page shows, except the provider list. */
export const getSettingsSnapshotFn = createServerFn({ method: 'GET' })
  .middleware([apiAuthMiddleware])
  .handler(async ({ context }) => {
    const currentUser = context.user
    const headers = getRequest().headers
    const now = new Date()

    const [session, methods, activeSessions, recentSessions, settingsRows] =
      await Promise.all([
        auth.api.getSession({ headers }),
        auth.api.listUserAccounts({ headers }).catch((error: unknown) => {
          console.error('[settings] listUserAccounts failed', error)
          return [] as AuthAccountMethod[]
        }),
        db
          .select(sessionColumns)
          .from(authSession)
          .where(
            and(
              eq(authSession.userId, currentUser.id),
              gt(authSession.expiresAt, now),
            ),
          )
          .orderBy(desc(authSession.updatedAt))
          .limit(8),
        db
          .select(sessionColumns)
          .from(authSession)
          .where(eq(authSession.userId, currentUser.id))
          .orderBy(desc(authSession.createdAt))
          .limit(8),
        db
          .select({ use_system_providers: user.use_system_providers })
          .from(user)
          .where(eq(user.id, currentUser.id))
          .limit(1),
      ])

    if (!session?.user) throw new Error('Unauthorized')
    const sessionUser = session.user as SessionUserWith2FA
    const userSettings = settingsRows.at(0)

    return {
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        image: sessionUser.image ?? '',
        role: currentUser.role,
      },
      currentSessionId: session.session.id,
      security: {
        twoFactorEnabled: Boolean(sessionUser.twoFactorEnabled),
      },
      methods: methods.map((method) => ({
        id: method.id,
        providerId: method.providerId,
        accountId: method.accountId,
        createdAt: method.createdAt,
      })),
      tinySessions: {
        active: activeSessions,
        recent: recentSessions,
      },
      use_system_providers: userSettings?.use_system_providers ?? true,
    }
  })
