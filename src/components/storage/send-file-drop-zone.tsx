'use client'

import * as React from 'react'
import { Upload, File } from 'lucide-react'

import { useWebRTC } from '@/hooks/use-webrtc'

type SendFileDropZoneProps = {
  disabled?: boolean
}

export function SendFileDropZone( { disabled }: SendFileDropZoneProps ) {
  const { sendFile, outgoingFiles, isConnected } = useWebRTC()
  const [isDragging, setIsDragging] = React.useState( false )
  const fileInputRef = React.useRef<HTMLInputElement>( null )

  const handleDragOver = ( e: React.DragEvent<HTMLDivElement> ) => {
    e.preventDefault()
    if ( disabled || !isConnected ) return
    setIsDragging( true )
  }

  const handleDragLeave = ( e: React.DragEvent<HTMLDivElement> ) => {
    e.preventDefault()
    setIsDragging( false )
  }

  const handleDrop = async ( e: React.DragEvent<HTMLDivElement> ) => {
    e.preventDefault()
    setIsDragging( false )
    if ( disabled || !isConnected ) return

    const files = Array.from( e.dataTransfer.files )
    files.forEach( ( file ) => sendFile( file ) )
  }

  const handleFileSelect = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    const files = Array.from( e.target.files || [] )
    files.forEach( ( file ) => sendFile( file ) )
    if ( fileInputRef.current ) {
      fileInputRef.current.value = ''
    }
  }

  if ( !isConnected ) {
    return (
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-4">
        <p className="text-muted-foreground text-sm">
          Connect to another device to send files
        </p>
      </div>
    )
  }

  const activeSends = outgoingFiles.filter( ( f ) => f.status === 'sending' )
  const completedSends = outgoingFiles.filter( ( f ) => f.status === 'sent' )

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        placeholder="Select files"
        className="hidden"
        onChange={handleFileSelect}
      />
      <div
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="text-primary h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Transfer files directly via WebRTC peer-to-peer
            </p>
          </div>
        </div>
      </div>

      {activeSends.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Sending...</p>
          {activeSends.map( ( file ) => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-md border p-3 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="truncate">{file.name}</p>
                <span className="text-xs text-muted-foreground shrink-0">
                  {Math.round( file.progress )}%
                </span>
              </div>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary ml-2">
                {/* eslint-disable-next-line */}
                <div
                  className="h-full bg-primary transition-all"
                  style={{ '--progress': `${file.progress}%` } as React.CSSProperties}
                />
              </div>
            </div>
          ) )}
        </div>
      )}

      {completedSends.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Sent ({completedSends.length})
          </p>
          {completedSends.map( ( file ) => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-md border border-green-200 bg-green-50/50 p-3 text-sm dark:border-green-900 dark:bg-green-950/20"
            >
              <File className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
              <p className="truncate">{file.name}</p>
              <span className="text-xs text-green-600 dark:text-green-400 ml-auto shrink-0">
                100%
              </span>
            </div>
          ) )}
        </div>
      )}
    </div>
  )
}
