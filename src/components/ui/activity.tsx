'use client'

import type { ReactNode } from 'react'

type ActivityProps = {
  when: boolean
  children: ReactNode
  fallback?: ReactNode
}

export function Activity({ when, children, fallback = null }: ActivityProps) {
  return when ? <>{children}</> : <>{fallback}</>
}
