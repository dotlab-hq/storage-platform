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

export type WebRTCContextValue = {
  isConnected: boolean
  incomingFiles: IncomingFile[]
  outgoingFiles: OutgoingFile[]
  sendFile: (file: File) => void
  rejectFile: (fileId: string) => void
  saveFile: (fileId: string, folderId: string | null) => Promise<void>
  clearReceived: () => void
}

export type WebRTCProviderProps = {
  children: React.ReactNode
  sessionToken: string | null
}
