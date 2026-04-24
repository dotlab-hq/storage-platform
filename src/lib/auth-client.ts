import { createAuthClient } from 'better-auth/react'
import {
  inferAdditionalFields,
  twoFactorClient,
  deviceAuthorizationClient,
} from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: 'string' },
        isAdmin: { type: 'boolean' },
        twoFactorEnabled: { type: 'boolean' },
      },
    }),
    twoFactorClient(),
    deviceAuthorizationClient(),
  ],
})

export function useAuth() {
  const { data: session, isPending, error } = authClient.useSession()
  return {
    user: session?.user ?? null,
    session: session?.session ?? null,
    isPending,
    error,
    ...authClient,
  }
}
