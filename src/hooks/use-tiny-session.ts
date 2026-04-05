'use client'

import * as React from 'react'
import { TINY_SESSION_COOKIE_NAME } from '@/lib/tiny-session'

function readCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null
  const pairs = cookieHeader.split(';')
  for (const pair of pairs) {
    const [rawName, ...rest] = pair.trim().split('=')
    if (rawName === name) {
      return decodeURIComponent(rest.join('='))
    }
  }
  return null
}

export function useTinySession() {
  const [session, setSession] = React.useState<{
    hasSession: boolean
    token: string | null
  }>({
    hasSession: false,
    token: null,
  })

  React.useEffect(() => {
    const token = readCookieValue(document.cookie, TINY_SESSION_COOKIE_NAME)
    setSession({ hasSession: !!token, token })
  }, [])

  return session
}
