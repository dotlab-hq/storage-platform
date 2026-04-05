'use client'

import * as React from 'react'
import { IncomingFilesRegion } from '@/components/storage/incoming-files-region'
import { SendFileDropZone } from '@/components/storage/send-file-drop-zone'
import { useWebRTC, type IncomingFile } from '@/hooks/use-webrtc'

type DeviceTransferSectionProps = {
  onSaveRequest: (file: IncomingFile) => void
}

export function DeviceTransferSection({
  onSaveRequest,
}: DeviceTransferSectionProps) {
  const { incomingFiles } = useWebRTC()

  if (incomingFiles.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <IncomingFilesRegion onSaveRequest={onSaveRequest} />
      <SendFileDropZone />
    </div>
  )
}
