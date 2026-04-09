'use client'

import * as React from 'react'
import { closeConnection, setupPeerConnection } from './connection-lifecycle'
import { startSignalPolling } from './connection-polling'
import type { ConnectionRefs } from './connection-types'
import { createFileSender } from './file-transfer-channel'
import { createSignalChannel } from './signal-channel'
import type { IncomingFile, OutgoingFile, WebRTCPeerRole } from './types'

export function useWebRTCConnection(sessionToken: string | null) {
  const [isConnected, setIsConnected] = React.useState(false)
  const [incomingFiles, setIncomingFiles] = React.useState<IncomingFile[]>([])
  const [outgoingFiles, setOutgoingFiles] = React.useState<OutgoingFile[]>([])

  const peerConnectionRef = React.useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = React.useRef<RTCDataChannel | null>(null)
  const pollingRef = React.useRef<number | null>(null)
  const queueRef = React.useRef<RTCIceCandidateInit[]>([])
  const refs = React.useMemo<ConnectionRefs>(
    () => ({
      peerConnectionRef,
      dataChannelRef,
      pollingRef,
      queueRef,
    }),
    [],
  )

  const startedRef = React.useRef(false)
  const roleRef = React.useRef<WebRTCPeerRole>('offerer')
  const activeSessionTokenRef = React.useRef<string | null>(sessionToken)

  const signalChannel = React.useMemo(
    () => createSignalChannel(activeSessionTokenRef),
    [],
  )

  const callbacks = React.useMemo(
    () => ({
      getSignal: signalChannel.getSignal,
      sendSignal: signalChannel.sendSignal,
      setIncomingFiles,
      setIsConnected,
    }),
    [signalChannel],
  )

  const terminateConnection = React.useCallback(() => {
    closeConnection(refs, setIsConnected)
    startedRef.current = false
  }, [refs])

  const startConnection = React.useCallback(
    (
      overrideSessionToken?: string | null,
      role: WebRTCPeerRole = 'answerer',
    ) => {
      const token = overrideSessionToken ?? sessionToken
      if (!token) {
        return
      }

      const shouldRestart =
        activeSessionTokenRef.current !== token || roleRef.current !== role

      activeSessionTokenRef.current = token
      roleRef.current = role

      if (startedRef.current && !shouldRestart) {
        return
      }

      if (shouldRestart) {
        terminateConnection()
      }

      startedRef.current = true

      void setupPeerConnection(role, refs, callbacks).then(() => {
        startSignalPolling(refs, callbacks)
      })
    },
    [callbacks, refs, sessionToken, terminateConnection],
  )

  const sendFile = React.useMemo(
    () => createFileSender(dataChannelRef, setOutgoingFiles),
    [dataChannelRef],
  )

  const rejectFile = React.useCallback((fileId: string) => {
    setIncomingFiles((previous) =>
      previous.filter((file) => file.id !== fileId),
    )
  }, [])

  const saveFile = React.useCallback(
    async (_fileId: string, _folderId: string | null) => {
      return
    },
    [],
  )

  const clearReceived = React.useCallback(() => {
    setIncomingFiles((previous) =>
      previous.filter((file) => file.status !== 'received'),
    )
  }, [])

  React.useEffect(() => {
    return () => {
      terminateConnection()
    }
  }, [terminateConnection])

  return {
    isConnected,
    incomingFiles,
    outgoingFiles,
    sendFile,
    rejectFile,
    saveFile,
    clearReceived,
    startConnection,
  }
}
