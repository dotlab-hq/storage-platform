import { useCallback, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { toast } from '@/components/ui/sonner'
import { classifyDroppedUploads } from '@/lib/drop-upload-classifier'
import { useUploader } from '@/hooks/use-uploader'

const hasFiles = (event: DragEvent) =>
  event.dataTransfer.types.includes('Files')

/**
 * Drop files or folders from the OS anywhere on the page to upload them into
 * `folderId`. Internal drags (moving a card onto a folder) are ignored here.
 */
export function useDragDrop(folderId: string | null) {
  const { uploadFiles, uploadFolders, readOnly } = useUploader(folderId)
  const [isDragging, setIsDragging] = useState(false)
  // dragenter/dragleave fire for every child element; count them.
  const depth = useRef(0)

  const onDragEnter = useCallback((event: DragEvent) => {
    if (!hasFiles(event)) return
    event.preventDefault()
    depth.current += 1
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((event: DragEvent) => {
    if (!hasFiles(event)) return
    event.preventDefault()
    depth.current = Math.max(0, depth.current - 1)
    if (depth.current === 0) setIsDragging(false)
  }, [])

  const onDragOver = useCallback((event: DragEvent) => {
    if (hasFiles(event)) event.preventDefault()
  }, [])

  const onDrop = useCallback(
    (event: DragEvent) => {
      if (!hasFiles(event)) return
      event.preventDefault()
      depth.current = 0
      setIsDragging(false)

      if (readOnly) {
        toast.error('This session is read-only')
        return
      }
      const { files, folders } = classifyDroppedUploads(event.dataTransfer)
      if (files.length > 0) void uploadFiles(files)
      if (folders.length > 0) void uploadFolders(folders)
    },
    [readOnly, uploadFiles, uploadFolders],
  )

  return {
    isDragging,
    dropZoneProps: { onDragEnter, onDragLeave, onDragOver, onDrop },
  }
}
