import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { resolveSession } from '@/lib/auth/resolve-session'

export type CurrentUser = {
  id: string
  email: string
  name: string | null
  image: string | null
  isAdmin: boolean
  /** Device ("tiny") sessions may be read-only. */
  readOnly: boolean
}

/** Returns the signed-in user, or null for anonymous requests. */
export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CurrentUser | null> => {
    const resolved = await resolveSession(getRequest().headers)
    if (!resolved) return null
    return {
      id: resolved.user.id,
      email: resolved.user.email,
      name: resolved.user.name,
      image: resolved.user.image,
      isAdmin: resolved.user.isAdmin,
      readOnly: resolved.tinySession?.permission === 'read',
    }
  },
)

export const CURRENT_USER_QUERY_KEY = ['current-user'] as const

export function currentUserQuery() {
  return queryOptions({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => getCurrentUserFn(),
    staleTime: 5 * 60_000,
  })
}

/**
 * The signed-in user inside the `/_app` layout. The layout's `beforeLoad`
 * guarantees it is loaded and non-null, so this never suspends or returns null.
 */
export function useCurrentUser(): CurrentUser {
  const { data } = useSuspenseQuery(currentUserQuery())
  if (!data) throw new Error('useCurrentUser() used outside the /_app layout')
  return data
}
