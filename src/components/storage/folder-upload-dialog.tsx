'use client'

import * as React from 'react'
import { createClientOnlyFn } from '@tanstack/react-start'
import { FolderUp, X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { uploadFolder } from '@/lib/folder-upload-utils'
import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { UploadingFile } from '@/types/storage'

type FolderUploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
  currentFolderId: string | null
  setUploads: React.Dispatch<React.SetStateAction<UploadingFile[]>>
  onUploadComplete: () => Promise<void> | void
}

import { useRouter } from '@tanstack/react-router'

export function FolderUploadDialog({
  open,
  onOpenChange,
  userId,
  currentFolderId,
  setUploads,
  onUploadComplete,
}: FolderUploadDialogProps) {
  const router = useRouter()
  const folderInputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [selectedFolders, setSelectedFolders] = React.useState<
    FileSystemDirectoryEntry[]
  >([])
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setSelectedFolders([])
      setUploadError(null)
    }
  }, [open])

  const resolveUserIdClient = createClientOnlyFn(async (uid: string | null) => {
    if (uid) return uid
    const { data } = await authClient.getSession()
    return data?.user?.id ?? null
  })

  const handleDragOver = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(true)
    },
    [],
  )

  const handleDragLeave = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsDragging(false)
      }
    },
    [],
  )

  const handleDrop = React.useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const items = Array.from(e.dataTransfer.items)

      const folders: FileSystemDirectoryEntry[] = []
      for (const item of items) {
        const entry = item.webkitGetAsEntry?.()
        if (entry?.isDirectory) {
          folders.push(entry as FileSystemDirectoryEntry)
        }
      }

      if (folders.length > 0) {
        setSelectedFolders((prev) => [...prev, ...folders])
      }
    },
    [],
  )

  const handleInputChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : []

      const fileEntries: FileSystemDirectoryEntry[] = []
      for (const file of files) {
        const entry = (
          file as File & { webkitGetAsEntry?: () => FileSystemEntry | null }
        ).webkitGetAsEntry?.()
        if (entry?.isDirectory) {
          fileEntries.push(entry as FileSystemDirectoryEntry)
        }
      }

      if (fileEntries.length > 0) {
        setSelectedFolders((prev) => [...prev, ...fileEntries])
      }
      e.target.value = ''
    },
    [],
  )

  const removeFolder = (index: number) => {
    setSelectedFolders((prev) => prev.filter((_, i) => i !== index))
  }

  const processFolder = React.useCallback(
    async (folderEntry: FileSystemDirectoryEntry, uid: string) => {
      const result = await uploadFolder(
        folderEntry,
        uid,
        currentFolderId,
        setUploads,
      )
      return result
    },
    [currentFolderId, setUploads],
  )

  const handleUpload = async () => {
    if (selectedFolders.length === 0) {
      setUploadError('Select at least one folder.')
      return
    }
    setUploadError(null)
    setIsUploading(true)

    const uid = await resolveUserIdClient(userId)
    if (!uid) {
      setUploadError('Session not ready.')
      setIsUploading(false)
      return
    }

    const folderConcurrency = 3
    const queue = [...selectedFolders]
    let uploadedCount = 0
    let failedCount = 0

    const worker = async () => {
      while (queue.length > 0) {
        const folderEntry = queue.shift()
        if (!folderEntry) break

        try {
          const result = await processFolder(folderEntry, uid)
          if (result.success && result.filesCount) {
            uploadedCount++
            toast.success(
              `Folder "${result.folderName}" uploaded with ${result.filesCount} files`,
            )
          } else if (result.error) {
            failedCount++
            toast.error(`Folder upload failed: ${result.error}`)
          }
        } catch (err) {
          failedCount++
          const msg = err instanceof Error ? err.message : 'Unknown error'
          toast.error(`Folder "${folderEntry.name}" upload failed: ${msg}`)
        }
      }
    }

    await Promise.all(Array.from({ length: folderConcurrency }, () => worker()))

    setSelectedFolders([])
    onOpenChange(false)
    router.invalidate()
    await onUploadComplete()
    setIsUploading(false)

    if (uploadedCount > 0) {
      toast.success(
        `Uploaded ${uploadedCount} folder${uploadedCount > 1 ? 's' : ''}`,
      )
    }
    if (failedCount > 0) {
      toast.error(
        `${failedCount} folder${failedCount > 1 ? 's' : ''} failed to upload`,
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Folder</DialogTitle>
          <DialogDescription>
            Drag and drop folders here, or click to browse.
          </DialogDescription>
        </DialogHeader>

        <div
          className={`rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors ${
            isDragging ? 'border-primary bg-muted' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-3">
            <FolderUp className="text-muted-foreground h-8 w-8" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Drop folders here</p>
              <p className="text-muted-foreground text-xs">
                Click to browse and select folders
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => folderInputRef.current?.click()}
            >
              Select Folder
            </Button>
          </div>
          <input
            ref={folderInputRef}
            type="file"
            {...({
              webkitdirectory: '',
              directory: '',
            } as React.InputHTMLAttributes<HTMLInputElement>)}
            multiple
            className="hidden"
            onChange={handleInputChange}
            aria-label="Select folders to upload"
          />
        </div>

        {selectedFolders.length > 0 && (
          <div className="max-h-40 overflow-y-auto rounded-md border">
            <ul className="divide-y">
              {selectedFolders.map((folder, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between p-2 text-sm"
                >
                  <span className="truncate">{folder.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 shrink-0"
                    onClick={() => removeFolder(i)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter>
          {uploadError && (
            <p className="text-destructive mr-auto text-sm">{uploadError}</p>
          )}
          <Button
            onClick={handleUpload}
            disabled={selectedFolders.length === 0 || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
