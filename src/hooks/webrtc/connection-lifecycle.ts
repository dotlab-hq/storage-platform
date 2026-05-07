import { setupFileTransferDataChannel } from './file-transfer-channel'
import type { ConnectionCallbacks, ConnectionRefs } from './connection-types'
import type { WebRTCPeerRole } from './types'

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export function stopSignalPolling(refs: ConnectionRefs) {
  if (refs.pollingRef.current) {
    window.clearInterval(refs.pollingRef.current)
    refs.pollingRef.current = null
  }
}

export function closeConnection(
  refs: ConnectionRefs,
  setIsConnected: ConnectionCallbacks['setIsConnected'],
) {
  stopSignalPolling(refs)

  refs.dataChannelRef.current = null
  refs.queueRef.current = []

  if (refs.peerConnectionRef.current) {
    try {
      refs.peerConnectionRef.current.close()
    } catch {
      // no-op
    }
    refs.peerConnectionRef.current = null
  }

  setIsConnected(false)
}

export async function setupPeerConnection(
  role: WebRTCPeerRole,
  refs: ConnectionRefs,
  callbacks: ConnectionCallbacks,
) {
  if (refs.peerConnectionRef.current) {
    try {
      refs.peerConnectionRef.current.close()
    } catch {
      // no-op
    }
    refs.peerConnectionRef.current = null
  }

  console.log(`Setting up peer connection as ${role}`)

  const connection = new RTCPeerConnection({ iceServers: ICE_SERVERS })
  refs.peerConnectionRef.current = connection

  connection.oniceconnectionstatechange = () => {
    const state = connection.iceConnectionState
    console.log(`ICE connection state: ${state}`)
    const connected =
      state === 'connected' || state === 'completed' || state === 'checking'
    callbacks.setIsConnected(connected)

    if (state === 'failed' || state === 'disconnected' || state === 'closed') {
      callbacks.setIsConnected(false)
    }
  }

  connection.onconnectionstatechange = () => {
    console.log(`Connection state: ${connection.connectionState}`)
    if (connection.connectionState === 'connected') {
      callbacks.setIsConnected(true)
    }

    if (
      connection.connectionState === 'failed' ||
      connection.connectionState === 'disconnected' ||
      connection.connectionState === 'closed'
    ) {
      callbacks.setIsConnected(false)
    }
  }

  connection.onicecandidate = (event) => {
    if (!event.candidate) {
      console.log('ICE candidate gathering complete')
      return
    }

    console.log('Sending ICE candidate')
    void callbacks.sendSignal({
      type: 'ice',
      candidate: event.candidate.toJSON(),
    })
  }

  connection.ondatachannel = (event) => {
    console.log('Data channel received from peer')
    refs.dataChannelRef.current = event.channel
    setupFileTransferDataChannel(event.channel, callbacks.setIncomingFiles)
  }

  if (role === 'offerer') {
    console.log('Creating data channel for offerer')
    const channel = connection.createDataChannel('fileTransfer')
    refs.dataChannelRef.current = channel
    setupFileTransferDataChannel(channel, callbacks.setIncomingFiles)

    console.log('Creating offer')
    const offer = await connection.createOffer()
    await connection.setLocalDescription(offer)
    console.log('Sending offer')
    await callbacks.sendSignal({ type: 'offer', sdp: offer })
  } else {
    console.log('Answerer ready - waiting for offer')
  }
}
