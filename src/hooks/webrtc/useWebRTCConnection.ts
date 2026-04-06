'use client'
import * as React from 'react'
import type { IncomingFile, OutgoingFile } from './types'
import { getSignalServerFn, setSignalServerFn } from './webrtc-server'

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]
const SIGNAL_POLL_INTERVAL_MS = 2000

export function useWebRTCConnection(sessionToken: string | null) {
  const [isConnected, setIsConnected] = React.useState(false)
  const [incomingFiles, setIncomingFiles] = React.useState<IncomingFile[]>([])
  const [outgoingFiles, setOutgoingFiles] = React.useState<OutgoingFile[]>([])

  const peerConnection = React.useRef<RTCPeerConnection | null>(null)
  const dataChannel = React.useRef<RTCDataChannel | null>(null)
  const pollingRef = React.useRef<number | null>(null)

  const activeSessionToken = React.useRef<string | null>(sessionToken)

  const setSignal = async (
    signal: RTCSessionDescriptionInit | RTCIceCandidateInit,
  ) => {
    const token = activeSessionToken.current
    if (!token) return
    await setSignalServerFn({
      data: {
        sessionToken: token,
        signal: JSON.stringify(signal),
      },
    })
  }

  const getSignal = async (): Promise<RTCSessionDescriptionInit | null> => {
    const token = activeSessionToken.current
    if (!token) return null
    const data = await getSignalServerFn({ data: { sessionToken: token } })
    if (data.hasSignal && data.signal) return JSON.parse(data.signal)
    return null
  }

  const setupDataChannel = (channel: RTCDataChannel) => {
    dataChannel.current = channel
    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'file-header') {
          const incomingFile: IncomingFile = {
            id: data.id,
            name: data.name,
            size: data.size,
            mimeType: data.mimeType,
            progress: 0,
            status: 'receiving',
          }
          setIncomingFiles((prev) => [...prev, incomingFile])
        } else if (data.type === 'file-chunk') {
          setIncomingFiles((prev) =>
            prev.map((f) => {
              if (f.id === data.id) {
                const newProgress = Math.min(100, f.progress + 10)
                return { ...f, progress: newProgress }
              }
              return f
            }),
          )
        } else if (data.type === 'file-complete') {
          setIncomingFiles((prev) =>
            prev.map((f) =>
              f.id === data.id
                ? { ...f, status: 'received' as const, progress: 100 }
                : f,
            ),
          )
        }
      } catch (e) {
        console.error('Failed to parse data channel message:', e)
      }
    }
    channel.onopen = () => console.log('Data channel opened')
    channel.onclose = () => console.log('Data channel closed')
  }

  const startConnection = async (overrideSessionToken?: string | null) => {
    const token = overrideSessionToken || sessionToken
    if (!token) return
    if (peerConnection.current) return // Prevent multiple connections

    activeSessionToken.current = token

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    peerConnection.current = pc

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState
      setIsConnected(state === 'connected' || state === 'completed')
    }

    const channel = pc.createDataChannel('fileTransfer')
    setupDataChannel(channel)
    pc.ondatachannel = (event) => setupDataChannel(event.channel)

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    await setSignal(offer)
    startPolling()
  }

  const startPolling = () => {
    if (pollingRef.current) return
    const poll = async () => {
      try {
        const peerSignal = await getSignal()
        if (peerSignal && peerConnection.current) {
          const current = peerConnection.current.remoteDescription
          if (!current) {
            await peerConnection.current.setRemoteDescription(peerSignal)
            if (peerSignal.type === 'offer') {
              const answer = await peerConnection.current.createAnswer()
              await peerConnection.current.setLocalDescription(answer)
              await setSignal(answer)
            }
          }
        }
      } catch (e) {
        console.error('Polling error:', e)
      }
    }
    poll()
    pollingRef.current = window.setInterval(poll, SIGNAL_POLL_INTERVAL_MS)
  }

  const stopPolling = () => {
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  const sendFile = (file: File) => {
    const channel = dataChannel.current
    if (!channel || channel.readyState !== 'open') return

    const fileId = crypto.randomUUID()
    channel.send(
      JSON.stringify({
        type: 'file-header',
        id: fileId,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
      }),
    )

    const chunkSize = 64 * 1024
    let offset = 0
    const sendChunk = () => {
      const chunk = file.slice(offset, offset + chunkSize)
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          channel.send(e.target.result as ArrayBuffer)
          offset += chunkSize
          setOutgoingFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, progress: Math.round((offset / file.size) * 100) }
                : f,
            ),
          )
          if (offset < file.size) sendChunk()
          else {
            channel.send(JSON.stringify({ type: 'file-complete', id: fileId }))
            setOutgoingFiles((prev) =>
              prev.map((f) =>
                f.id === fileId
                  ? { ...f, status: 'sent' as const, progress: 100 }
                  : f,
              ),
            )
          }
        }
      }
      reader.readAsArrayBuffer(chunk)
    }

    setOutgoingFiles((prev) => [
      ...prev,
      {
        id: fileId,
        name: file.name,
        size: file.size,
        file,
        progress: 0,
        status: 'sending',
      },
    ])
    sendChunk()
  }

  const rejectFile = (fileId: string) =>
    setIncomingFiles((prev) => prev.filter((f) => f.id !== fileId))
  const saveFile = async (_fileId: string, _folderId: string | null) => {}
  const clearReceived = () =>
    setIncomingFiles((prev) => prev.filter((f) => f.status !== 'received'))

  const initiateConnection = (overrideSessionToken?: string | null) => {
    void startConnection(overrideSessionToken)
  }

  React.useEffect(() => {
    if (sessionToken) void startConnection()
    return () => {
      stopPolling()
      peerConnection.current?.close()
      peerConnection.current = null
    }
  }, [sessionToken])

  return {
    isConnected,
    incomingFiles,
    outgoingFiles,
    sendFile,
    rejectFile,
    saveFile,
    clearReceived,
    startConnection: initiateConnection,
  }
}
