import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { admin } from "better-auth/plugins/admin"
import { twoFactor } from "better-auth/plugins/two-factor"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

import { getDb } from "@/db"
import { USER_ROLES } from "@/lib/authz"
import * as schema from "@/db/schema/auth-schema"
import { userStorage } from "@/db/schema/storage"
import {
  DEFAULT_ALLOCATED_STORAGE_BYTES,
  DEFAULT_FILE_SIZE_LIMIT_BYTES
} from "@/lib/storage-quota-constants"
import { sendResetPasswordEmail } from "@/lib/email/send-reset-password-email"
import type { Env } from '@/types'

type RuntimeCloudflare = {
  runtime?: {
    cloudflare?: {
      env?: Env
    }
  }
}

type EventCloudflare = {
  req?: {
    runtime?: {
      cloudflare?: {
        env?: Env
      }
    }
  }
}

function getCloudflareEnvFromRequest( request?: Request ): Env | undefined {
  const runtimeRequest = request as Request & RuntimeCloudflare
  return runtimeRequest.runtime?.cloudflare?.env
}

function getCloudflareEnvFromEvent( event?: EventCloudflare ): Env | undefined {
  return event?.req?.runtime?.cloudflare?.env
}

export function createAuth( env?: Env ) {
  const db = getDb( env )

  return betterAuth( {
    database: drizzleAdapter( db, {
      provider: "pg",
      schema,
    } ),

    databaseHooks: {
      user: {
        create: {
          after: async ( createdUser ) => {
            await db
              .insert( userStorage )
              .values( {
                userId: createdUser.id,
                allocatedStorage: DEFAULT_ALLOCATED_STORAGE_BYTES,
                fileSizeLimit: DEFAULT_FILE_SIZE_LIMIT_BYTES,
                usedStorage: 0,
              } )
              .onConflictDoNothing( {
                target: userStorage.userId,
              } )
          },
        },
      },
    },

    appName: "DOT Storage Platform",

    advanced: {
      cookies: {
        state: {
          attributes: {
            sameSite:
              process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
          },
        },
      },
    },

    socialProviders: {
      github: {
        clientId: process.env._GITHUB_CLIENT_ID!,
        clientSecret: process.env._GITHUB_CLIENT_SECRET!,
      },
    },

    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ( { user, url, token } ) => {
        await sendResetPasswordEmail( {
          to: user.email,
          resetUrl: url,
          token,
          recipientName: user.name,
          placement: "top",
        } )
      },
    },

    user: {
      additionalFields: {
        isAdmin: {
          type: "boolean",
          default: false,
        },
      },
    },

    plugins: [
      tanstackStartCookies(),
      admin( {
        defaultRole: USER_ROLES.user,
        adminRoles: [USER_ROLES.admin],
      } ),
      twoFactor(),
    ],
  } )
}

export function createAuthFromRequest( request?: Request ) {
  return createAuth( getCloudflareEnvFromRequest( request ) )
}

export function createAuthFromEvent( event?: EventCloudflare ) {
  return createAuth( getCloudflareEnvFromEvent( event ) )
}

type AuthInstance = ReturnType<typeof createAuth>

const authProxyHandler: ProxyHandler<AuthInstance> = {
  get( _target, property, receiver ) {
    const resolvedAuth = createAuth()
    return Reflect.get( resolvedAuth, property, receiver )
  },
}

export const auth = new Proxy( {} as AuthInstance, authProxyHandler )