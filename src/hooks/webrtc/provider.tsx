'use client'
import type { WebRTCProviderProps } from './types'
import { WebRTCContext } from './context'
import { useWebRTCConnection } from './useWebRTCConnection'

export function WebRTCProvider({ children, sessionToken }: WebRTCProviderProps) {
  const {
    isConnected,
    incomingFiles,
    outgoingFiles,
    sendFile,
    rejectFile,
    saveFile,
    clearReceived
  } = useWebRTCConnection(sessionToken)

  return (
    <WebRTCContext.Provider
      value={{
        isConnected,
        incomingFiles,
        outgoingFiles,
        sendFile,
        rejectFile,
        saveFile,
        clearReceived,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  )
}
