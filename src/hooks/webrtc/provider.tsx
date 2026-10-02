'use client'
import type { WebRTCProviderProps } from './types'
import { WebRTCContext } from './context'
import { useWebRTCConnection } from './useWebRTCConnection'

export function WebRTCProvider({
  children,
  sessionToken,
}: WebRTCProviderProps) {
  const {
    isConnected,
    incomingFiles,
    outgoingFiles,
    sendFile,
    rejectFile,
    markSaved,
    clearReceived,
    startConnection,
  } = useWebRTCConnection(sessionToken)

  return (
    <WebRTCContext.Provider
      value={{
        isConnected,
        incomingFiles,
        outgoingFiles,
        sendFile,
        rejectFile,
        markSaved,
        clearReceived,
        startConnection,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  )
}
