'use client'

import * as React from 'react'
import { Wifi, WifiOff, Smartphone, ChevronDown, ChevronUp } from 'lucide-react'
import { IncomingFilesRegion } from '@/components/storage/incoming-files-region'
import { SendFileDropZone } from '@/components/storage/send-file-drop-zone'
import { useTinySession } from '@/hooks/use-tiny-session'
import { useWebRTC, type IncomingFile } from '@/hooks/use-webrtc'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'

const WEBRTC_ENABLED_KEY = 'dot_webrtc_enabled'

type DeviceTransferSectionProps = {
  onSaveRequest: (file: IncomingFile) => void
}

export function DeviceTransferSection({
  onSaveRequest,
}: DeviceTransferSectionProps) {
  const [webrtcEnabled, setWebrtcEnabled] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const tinySession = useTinySession()
  const { incomingFiles } = useWebRTC()

  React.useEffect(() => {
    const stored = localStorage.getItem(WEBRTC_ENABLED_KEY)
    setWebrtcEnabled(stored === 'true')

    const handleToggle = (e: CustomEvent) => {
      setWebrtcEnabled(e.detail)
    }
    window.addEventListener('webrtc-toggled', handleToggle as EventListener)
    return () =>
      window.removeEventListener(
        'webrtc-toggled',
        handleToggle as EventListener,
      )
  }, [])

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
          <IncomingFilesRegion onSaveRequest={onSaveRequest} />
        )}
        {webrtcEnabled && hasActiveSession && <SendFileDropZone />}
        {webrtcEnabled && !hasActiveSession && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Smartphone className="h-4 w-4" />
            <span>Scan QR code at /hot to enable device transfers</span>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
