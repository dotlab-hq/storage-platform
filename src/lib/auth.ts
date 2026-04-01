import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { admin } from "better-auth/plugins/admin"
import { twoFactor } from "better-auth/plugins/two-factor"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import { USER_ROLES } from "@/lib/authz"
import * as schema from "@/db/schema/auth-schema"; // your drizzle schema
import { userStorage } from "@/db/schema/storage";
import { sendResetPasswordEmail } from "@/lib/email/send-reset-password-email";

export const auth = betterAuth( {
  database: drizzleAdapter( db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: schema,
  } ),
  databaseHooks: {
    user: {
      create: {
        after: async ( createdUser ) => {
          await db
            .insert( userStorage )
            .values( { userId: createdUser.id } )
            .onConflictDoNothing( { target: userStorage.userId } );
        },
      },
    },
  },
  appName: "DOT Storage Platform",
  advanced: {
    cookies: {
      state: {
        attributes: {
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
      } )
    },
  },
  user: {
    additionalFields: {
      isAdmin: {
        type: "boolean",
        default: false,
      }
    }
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
