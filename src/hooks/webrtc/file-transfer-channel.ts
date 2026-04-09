import type * as React from 'react'
import type { IncomingFile, OutgoingFile } from './types'

type IncomingSetter = React.Dispatch<React.SetStateAction<IncomingFile[]>>
type OutgoingSetter = React.Dispatch<React.SetStateAction<OutgoingFile[]>>

type FileHeaderMessage = {
  type: 'file-header'
  id: string
  name: string
  size: number
  mimeType: string
}

type FileChunkMessage = {
  type: 'file-chunk'
  id: string
}

type FileCompleteMessage = {
  type: 'file-complete'
  id: string
}

type DataChannelMessage =
  | FileHeaderMessage
  | FileChunkMessage
  | FileCompleteMessage

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseMessage(raw: string): DataChannelMessage | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (!isObjectRecord(parsed) || typeof parsed.type !== 'string') {
    return null
  }

  if (
    parsed.type === 'file-header' &&
    typeof parsed.id === 'string' &&
    typeof parsed.name === 'string' &&
    typeof parsed.size === 'number' &&
    typeof parsed.mimeType === 'string'
  ) {
    return {
      type: 'file-header',
      id: parsed.id,
      name: parsed.name,
      size: parsed.size,
      mimeType: parsed.mimeType,
    }
  }

  if (parsed.type === 'file-chunk' && typeof parsed.id === 'string') {
    return { type: 'file-chunk', id: parsed.id }
  }

  if (parsed.type === 'file-complete' && typeof parsed.id === 'string') {
    return { type: 'file-complete', id: parsed.id }
  }

  return null
}

export function setupFileTransferDataChannel(
  channel: RTCDataChannel,
  setIncomingFiles: IncomingSetter,
) {
  channel.onmessage = (event) => {
    if (typeof event.data !== 'string') {
      return
    }

    const message = parseMessage(event.data)
    if (!message) {
      return
    }

    if (message.type === 'file-header') {
      const incomingFile: IncomingFile = {
        id: message.id,
        name: message.name,
        size: message.size,
        mimeType: message.mimeType,
        progress: 0,
        status: 'receiving',
      }
      setIncomingFiles((previous) => [...previous, incomingFile])
      return
    }

    if (message.type === 'file-chunk') {
      setIncomingFiles((previous) =>
        previous.map((file) => {
          if (file.id !== message.id) {
            return file
          }
          const nextProgress = Math.min(100, file.progress + 10)
          return { ...file, progress: nextProgress }
        }),
      )
      return
    }

    setIncomingFiles((previous) =>
      previous.map((file) =>
        file.id === message.id
          ? { ...file, progress: 100, status: 'received' as const }
          : file,
      ),
    )
  }

  channel.onopen = () => console.log('Data channel opened')
  channel.onclose = () => console.log('Data channel closed')
}

export function createFileSender(
  dataChannelRef: React.MutableRefObject<RTCDataChannel | null>,
  setOutgoingFiles: OutgoingSetter,
) {
  return (file: File) => {
    const channel = dataChannelRef.current
    if (!channel || channel.readyState !== 'open') {
      return
    }

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
      reader.onload = (event) => {
        if (!event.target?.result) {
          return
        }

        channel.send(event.target.result as ArrayBuffer)
        offset += chunkSize

        setOutgoingFiles((previous) =>
          previous.map((queued) =>
            queued.id === fileId
              ? { ...queued, progress: Math.round((offset / file.size) * 100) }
              : queued,
          ),
        )

        if (offset < file.size) {
          sendChunk()
          return
        }

        channel.send(JSON.stringify({ type: 'file-complete', id: fileId }))
        setOutgoingFiles((previous) =>
          previous.map((queued) =>
            queued.id === fileId
              ? { ...queued, status: 'sent' as const, progress: 100 }
              : queued,
          ),
        )
      }
      reader.readAsArrayBuffer(chunk)
    }

    setOutgoingFiles((previous) => [
      ...previous,
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
}
