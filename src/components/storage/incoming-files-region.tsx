'use client'


import { MoreHorizontal, Trash2, HardDrive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatFileSize } from '@/lib/file-utils'
import { useWebRTC } from '@/hooks/use-webrtc'
import type { IncomingFile } from '@/hooks/use-webrtc';

type IncomingFilesRegionProps = {
  onSaveRequest: ( file: IncomingFile ) => void
}

export function IncomingFilesRegion( {
  onSaveRequest,
}: IncomingFilesRegionProps ) {
  const { incomingFiles, rejectFile, clearReceived } = useWebRTC()
  const receivedFiles = incomingFiles.filter( ( f ) => f.status === 'received' )
  const receivingFiles = incomingFiles.filter( ( f ) => f.status === 'receiving' )

  if ( incomingFiles.length === 0 ) {
    return null
  }

  return (
    <div className="space-y-2">
      {receivingFiles.map( ( file ) => (
        <IncomingFileReceivingCard key={file.id} file={file} />
      ) )}

      {receivedFiles.map( ( file ) => (
        <IncomingFileReceivedCard
          key={file.id}
          file={file}
          onSave={() => onSaveRequest( file )}
          onReject={() => rejectFile( file.id )}
        />
      ) )}

      {receivedFiles.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearReceived}
          className="text-muted-foreground"
        >
          Clear received
        </Button>
      )}
    </div>
  )
}

function IncomingFileReceivingCard( { file }: { file: IncomingFile } ) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-muted-foreground text-xs">
          Receiving... {file.progress}%
        </p>
      </div>
      <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all"
          style={{
            /* stylelint-disable-next-line */
            '--progress': `${file.progress}%`,
          } as React.CSSProperties}
        />
      </div>
    </div>
  )
}

function IncomingFileReceivedCard( {
  file,
  onSave,
  onReject,
}: {
  file: IncomingFile
  onSave: () => void
  onReject: () => void
} ) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-muted-foreground text-xs">
          {formatFileSize( file.size )} received
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onSave}>
            <HardDrive className="mr-2 h-4 w-4" />
            Save to storage
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onReject} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Reject / Discard
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
