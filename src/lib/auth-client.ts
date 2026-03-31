import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields, twoFactorClient } from "better-auth/client/plugins"

export const authClient = createAuthClient( {
  plugins: [
    inferAdditionalFields( {
      user: {
        role: { type: "string" },
        isAdmin: { type: "boolean" },
        twoFactorEnabled: { type: "boolean" },
      },
    } ),
    twoFactorClient(),
  ],
} )
