'use client'
import * as React from 'react'
import type { WebRTCContextValue } from './types'

export const WebRTCContext = React.createContext<WebRTCContextValue | null>(
  null,
)

export function useWebRTC() {
  const ctx = React.useContext(WebRTCContext)
  if (!ctx) {
    throw new Error('useWebRTC must be used within WebRTCProvider')
  }
  return ctx
}
