'use client'

import * as React from 'react'
import { Wifi, WifiOff, Smartphone, ChevronDown, ChevronUp } from 'lucide-react'
import { IncomingFilesRegion } from '@/components/storage/incoming-files-region'
import { SendFileDropZone } from '@/components/storage/send-file-drop-zone'
import { useTinySession } from '@/hooks/use-tiny-session'
import { useWebRTC } from '@/hooks/use-webrtc'
import type { IncomingFile } from '@/hooks/use-webrtc'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { usePreferencesStore } from '@/stores/preferences-store'
import { useUploader } from '@/hooks/use-uploader'

type DeviceTransferSectionProps = {
  /** Folder that received files are saved into. */
  folderId: string | null
}

/** Files sent from another device over WebRTC, with "save to this folder". */
export function DeviceTransferSection({ folderId }: DeviceTransferSectionProps) {
  const webrtcEnabled = usePreferencesStore((state) => state.webrtcEnabled)
  const [isOpen, setIsOpen] = React.useState(false)
  const tinySession = useTinySession()
  const { incomingFiles, markSaved } = useWebRTC()
  const { uploadFiles } = useUploader(folderId)

  const saveToFolder = async (incoming: IncomingFile) => {
    if (!incoming.blob) return
    markSaved(incoming.id)
    const file = new File([incoming.blob], incoming.name, {
      type: incoming.mimeType || 'application/octet-stream',
    })
    await uploadFiles([file])
  }

  const showSection = webrtcEnabled || incomingFiles.length > 0

  if (!showSection) {
    return null
  }

  const hasActiveSession = tinySession.hasSession

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-lg border bg-card p-4"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full items-center justify-between px-0 hover:bg-transparent"
        >
          <div className="flex items-center gap-2">
            {webrtcEnabled && hasActiveSession ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium">WebRTC Transfers</span>
          </div>
          <div className="flex items-center gap-2">
            {webrtcEnabled && (
              <span className="text-xs text-muted-foreground">
                {hasActiveSession ? <>Connected</> : <>Scan QR to connect</>}
              </span>
            )}
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-2">
        {incomingFiles.length > 0 && (
          <IncomingFilesRegion onSaveRequest={(file) => void saveToFolder(file)} />
        )}
        {webrtcEnabled && hasActiveSession && <SendFileDropZone />}
        {webrtcEnabled && !hasActiveSession && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Smartphone className="h-4 w-4" />
            <span>Visit /hot on another device to connect</span>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
