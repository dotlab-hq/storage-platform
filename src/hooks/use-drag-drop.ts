import { useCallback, useRef, useState } from 'react'
import { toast } from '@/components/ui/sonner'
import { uploadBatch } from '@/lib/upload-utils'
import { formatFileSize } from '@/lib/file-utils'
import type { StorageItem, UploadingFile } from '@/types/storage'
import { useRouter } from '@tanstack/react-router'

export function useDragDrop(
  userId: string | null,
  currentFolderId: string | null,
  setUploads: React.Dispatch<React.SetStateAction<UploadingFile[]>>,
  onComplete: () => Promise<void>,
  setItems?: React.Dispatch<React.SetStateAction<StorageItem[]>>,
  fileSizeLimit?: number | null,
) {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    if (e.dataTransfer.types.includes('Files')) setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      dragCounter.current = 0

      if (!userId) {
        toast.error('Not authenticated')
        return
      }

      const files = Array.from(e.dataTransfer.files)
      if (files.length === 0) return

      let allowedFiles = files
      if (fileSizeLimit) {
        const oversized = files.filter((file) => file.size > fileSizeLimit)
        if (oversized.length > 0) {
          const MAX_SHOWN = 3
          const shown = oversized.slice(0, MAX_SHOWN).map((file) => file.name)
          const extra = oversized.length - MAX_SHOWN
          const names =
            extra > 0
              ? `${shown.join(', ')}, and ${extra} more`
              : shown.join(', ')
          toast.error(
            `Warning: ${oversized.length} file${oversized.length > 1 ? 's' : ''} exceed your ${formatFileSize(fileSizeLimit)} limit: ${names}`,
          )
        }
        allowedFiles = files.filter((file) => file.size <= fileSizeLimit)
        if (allowedFiles.length === 0) {
          return
        }
      }

      const newUploads: UploadingFile[] = allowedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'uploading' as const,
      }))

      setUploads((prev) => [...newUploads, ...prev])

      const tasks = newUploads.map((u) => ({ id: u.id, file: u.file }))
      const successCount = await uploadBatch(
        tasks,
        userId,
        currentFolderId,
        3,
        setUploads,
        setItems
          ? (fileInfo) => {
              setItems((prev) => [
                ...prev,
                {
                  id: fileInfo.id,
                  name: fileInfo.name,
                  objectKey: fileInfo.objectKey,
                  mimeType: fileInfo.mimeType,
                  sizeInBytes: fileInfo.sizeInBytes,
                  userId,
                  folderId: currentFolderId,
                  createdAt: fileInfo.createdAt,
                  updatedAt: fileInfo.createdAt,
                  type: 'file' as const,
                },
              ])
            }
          : undefined,
      )

      if (successCount > 0) {
        toast.success(
          `${successCount} file${successCount > 1 ? 's' : ''} uploaded`,
        )

        // Always invalidate the router cache so that subsequent navigations fetch fresh data
        router.invalidate()

        // Skip full refresh when setItems is provided because each completed
        // file has already been optimistically added to the items list.
        if (!setItems) await onComplete()
      }
    },
    [
      userId,
      currentFolderId,
      setUploads,
      onComplete,
      setItems,
      fileSizeLimit,
      router,
    ],
  )

  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  }
}
