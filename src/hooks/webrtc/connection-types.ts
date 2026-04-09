import type * as React from 'react'
import type { IncomingFile } from './types'
import type { SignalPayload } from './signal-channel'

export type ConnectionRefs = {
  peerConnectionRef: React.MutableRefObject<RTCPeerConnection | null>
  dataChannelRef: React.MutableRefObject<RTCDataChannel | null>
  pollingRef: React.MutableRefObject<number | null>
  queueRef: React.MutableRefObject<RTCIceCandidateInit[]>
}

export type ConnectionCallbacks = {
  getSignal: () => Promise<SignalPayload | null>
  sendSignal: (payload: SignalPayload) => Promise<void>
  setIncomingFiles: React.Dispatch<React.SetStateAction<IncomingFile[]>>
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>
}
