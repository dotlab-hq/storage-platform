'use client'

import * as React from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWebRTC } from '@/hooks/use-webrtc'

type SendFileDropZoneProps = {
  disabled?: boolean
}

export function SendFileDropZone({ disabled }: SendFileDropZoneProps) {
  const { sendFile, outgoingFiles, isConnected } = useWebRTC()
  const [isDragging, setIsDragging] = React.useState(false)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (disabled || !isConnected) return
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || !isConnected) return

    const files = Array.from(e.dataTransfer.files)
    files.forEach((file) => sendFile(file))
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-4">
        <p className="text-muted-foreground text-sm">
          Connect to another device to send files
        </p>
      </div>
    )
  }

  const activeSends = outgoingFiles.filter((f) => f.status === 'sending')

  return (
    <div className="space-y-2">
      <div
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Send className="text-muted-foreground mb-2 h-6 w-6" />
        <p className="text-muted-foreground text-center text-sm">
          Drop files here to send to other device
        </p>
        <p className="text-muted-foreground text-xs">
          Files transfer directly via WebRTC
        </p>
      </div>

      {activeSends.length > 0 && (
        <div className="space-y-1">
          {activeSends.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-md border p-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate">{file.name}</p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
