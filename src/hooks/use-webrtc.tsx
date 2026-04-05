'use client'

import * as React from 'react'

export type IncomingFile = {
  id: string
  name: string
  size: number
  mimeType: string
  progress: number
  blob?: Blob
  status: 'receiving' | 'received' | 'saved'
}

export type OutgoingFile = {
  id: string
  name: string
  size: number
  file: File
  progress: number
  status: 'pending' | 'sending' | 'sent' | 'failed'
}

type WebRTCContextValue = {
  isConnected: boolean
  incomingFiles: IncomingFile[]
  outgoingFiles: OutgoingFile[]
  sendFile: (file: File) => void
  rejectFile: (fileId: string) => void
  saveFile: (fileId: string, folderId: string | null) => Promise<void>
  clearReceived: () => void
}

const WebRTCContext = React.createContext<WebRTCContextValue | null>(null)

export function useWebRTC() {
  const ctx = React.useContext(WebRTCContext)
  if (!ctx) {
    throw new Error('useWebRTC must be used within WebRTCProvider')
  }
  return ctx
}

type WebRTCProviderProps = {
  children: React.ReactNode
  sessionToken: string | null
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export function WebRTCProvider({
  children,
  sessionToken,
}: WebRTCProviderProps) {
  const [isConnected, setIsConnected] = React.useState(false)
  const [peerConnection, setPeerConnection] =
    React.useState<RTCPeerConnection | null>(null)
  const [incomingFiles, setIncomingFiles] = React.useState<IncomingFile[]>([])
  const [outgoingFiles, setOutgoingFiles] = React.useState<OutgoingFile[]>([])
  const [dataChannel, setDataChannel] = React.useState<RTCDataChannel | null>(
    null,
  )

  const startConnection = async (_token: string) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    pc.oniceconnectionstatechange = () => {
      setIsConnected(pc.iceConnectionState === 'connected')
    }

    pc.ondatachannel = (event) => {
      setupDataChannel(event.channel)
    }

    setPeerConnection(pc)
  }

  const setupDataChannel = (channel: RTCDataChannel) => {
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

    setDataChannel(channel)
  }

  const sendFile = (file: File) => {
    if (!dataChannel || dataChannel.readyState !== 'open') {
      console.error('Data channel not ready')
      return
    }

    const fileId = crypto.randomUUID()

    const fileHeader = {
      type: 'file-header',
      id: fileId,
      name: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
    }
    dataChannel.send(JSON.stringify(fileHeader))

    const chunkSize = 64 * 1024
    let offset = 0

    const sendChunk = () => {
      const chunk = file.slice(offset, offset + chunkSize)
      const reader = new FileReader()

      reader.onload = (e) => {
        if (e.target?.result) {
          dataChannel.send(e.target.result as ArrayBuffer)
          offset += chunkSize

          setOutgoingFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, progress: Math.round((offset / file.size) * 100) }
                : f,
            ),
          )

          if (offset < file.size) {
            sendChunk()
          } else {
            dataChannel.send(
              JSON.stringify({ type: 'file-complete', id: fileId }),
            )
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

    const outgoingFile: OutgoingFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      file,
      progress: 0,
      status: 'sending',
    }
    setOutgoingFiles((prev) => [...prev, outgoingFile])

    sendChunk()
  }

  const rejectFile = (fileId: string) => {
    setIncomingFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const saveFile = async (_fileId: string, _folderId: string | null) => {
    // TODO: Implement actual file save
  }

  const clearReceived = () => {
    setIncomingFiles((prev) => prev.filter((f) => f.status !== 'received'))
  }

  React.useEffect(() => {
    if (sessionToken) {
      void startConnection(sessionToken)
    }

    return () => {
      peerConnection?.close()
    }
  }, [sessionToken])

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
