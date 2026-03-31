import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import * as schema from "@/db/schema/auth-schema"; // your drizzle schema
import { userStorage } from "@/db/schema/storage";
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
  user: {
    additionalFields: {
      isAdmin: {
        type: "boolean",
        default: false,
      }
    }
  },

  plugins: [tanstackStartCookies()],
} )
