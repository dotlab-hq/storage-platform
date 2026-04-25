import { useCallback, useRef, useState } from 'react'
import { toast } from '@/components/ui/sonner'
import { uploadBatch } from '@/lib/upload-utils'
import { formatFileSize } from '@/lib/file-utils'
import { uploadFolder } from '@/lib/folder-upload-utils'
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

  const extractFilesAndFolders = useCallback(
    (
      e: React.DragEvent,
    ): { files: File[]; folders: FileSystemDirectoryEntry[] } => {
      const items = Array.from(e.dataTransfer.items)
      const files: File[] = []
      const folders: FileSystemDirectoryEntry[] = []

      for (const item of items) {
        const entry = item.webkitGetAsEntry?.()
        if (entry) {
          if (entry.isDirectory) {
            folders.push(entry as FileSystemDirectoryEntry)
          } else if (entry.isFile) {
            const fileEntry = entry as FileSystemFileEntry
            const fileList = Array.from(e.dataTransfer.files)
            const file = fileList.find((f: File) => f.name === fileEntry.name)
            if (file) files.push(file)
          }
        }
      }

      if (files.length === 0 && folders.length === 0) {
        files.push(...Array.from(e.dataTransfer.files))
      }

      return { files, folders }
    },
    [],
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      dragCounter.current = 0

      if (!userId) {
        toast.error('Not authenticated')
        return
      }

      const { files, folders } = extractFilesAndFolders(e)

      if (files.length === 0 && folders.length === 0) return

      if (files.length > 0) {
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

          router.invalidate()

          if (!setItems) await onComplete()
        }
      }

      if (folders.length > 0) {
        const folderConcurrency = 3
        const processFolder = async (
          folder: FileSystemDirectoryEntry,
        ): Promise<{
          folderName: string
          filesCount: number
          success: boolean
          error?: string
        }> => {
          const result = await uploadFolder(
            folder,
            userId,
            currentFolderId,
            setUploads,
          )
          return {
            folderName: result.folderName || folder.name,
            filesCount: result.filesCount || 0,
            success: result.success,
            error: result.error,
          }
        }

        const queue = [...folders]
        const worker = async () => {
          while (queue.length > 0) {
            const folder = queue.shift()
            if (!folder) break
            try {
              await processFolder(folder)
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err)
              toast.error(`Folder "${folder.name}" upload failed: ${msg}`)
            }
          }
        }

        await Promise.all(
          Array.from({ length: folderConcurrency }, () => worker()),
        )

        router.invalidate()
        await onComplete()
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
      extractFilesAndFolders,
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
