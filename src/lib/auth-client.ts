import { createAuthClient } from 'better-auth/react'
import { adminClient, twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient( {
  plugins: [adminClient(), twoFactorClient()],
} )
