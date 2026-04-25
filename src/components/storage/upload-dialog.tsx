'use client'

import * as React from 'react'
import { useRouter } from '@tanstack/react-router'
import { createClientOnlyFn } from '@tanstack/react-start'
import { Upload, X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { uploadBatch } from '@/lib/upload-utils'
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
import { formatFileSize } from '@/lib/file-utils'
import type { StorageItem, UploadingFile } from '@/types/storage'
import { cn } from '@/lib/utils'

type FileUploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
  currentFolderId: string | null
  setUploads: React.Dispatch<React.SetStateAction<UploadingFile[]>>
  onUploadComplete: () => Promise<void> | void
  setItems?: React.Dispatch<React.SetStateAction<StorageItem[]>>
  fileSizeLimit?: number | null
}

export function FileUploadDialog({
  open,
  onOpenChange,
  userId,
  currentFolderId,
  setUploads,
  onUploadComplete,
  setItems,
  fileSizeLimit,
}: FileUploadDialogProps) {
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [uploadError, setUploadError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setSelectedFiles([])
      setUploadError(null)
    }
  }, [open])

  const dedupeAndAppend = React.useCallback(
    (incoming: File[]) => {
      if (fileSizeLimit) {
        const oversized = incoming.filter((f) => f.size > fileSizeLimit)
        if (oversized.length > 0) {
          const MAX_SHOWN = 3
          const shown = oversized.slice(0, MAX_SHOWN).map((f) => f.name)
          const extra = oversized.length - MAX_SHOWN
          const names = extra > 0 ? [...shown, `and ${extra} more`] : shown
          setUploadError(
            `${oversized.length} file${oversized.length > 1 ? 's' : ''} exceed${oversized.length === 1 ? 's' : ''} the ${formatFileSize(fileSizeLimit)} limit: ${names.join(', ')}`,
          )
          incoming = incoming.filter((f) => f.size <= fileSizeLimit)
          if (incoming.length === 0) return
        }
      }
      setSelectedFiles((cur) => {
        const existing = new Set(
          cur.map((f) => `${f.name}-${f.size}-${f.lastModified}`),
        )
        const additions = incoming.filter(
          (f) => !existing.has(`${f.name}-${f.size}-${f.lastModified}`),
        )
        return [...cur, ...additions]
      })
    },
    [fileSizeLimit],
  )

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) dedupeAndAppend(files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length) dedupeAndAppend(files)
    e.target.value = ''
  }

  const resolveUserId = createClientOnlyFn(async (uid: string | null) => {
    if (uid) return uid
    const { data } = await authClient.getSession()
    return data?.user?.id ?? null
  })

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      setUploadError('Select at least one file.')
      return
    }
    setUploadError(null)
    const uid = await resolveUserId(userId)
    if (!uid) {
      setUploadError('Session not ready.')
      return
    }

    const newUploads: UploadingFile[] = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'uploading' as const,
      targetFolderId: currentFolderId,
    }))
    setUploads((prev) => [...newUploads, ...prev])
    setSelectedFiles([])
    onOpenChange(false)

    const tasks = newUploads.map((u) => ({ id: u.id, file: u.file }))
    const count = await uploadBatch(
      tasks,
      uid,
      currentFolderId,
      3,
      (fileInfo) => {
        if (setItems) {
          setItems((prev) => [
            ...prev,
            {
              id: fileInfo.id,
              name: fileInfo.name,
              objectKey: fileInfo.objectKey,
              mimeType: fileInfo.mimeType,
              sizeInBytes: fileInfo.sizeInBytes,
              userId: uid,
              folderId: currentFolderId,
              createdAt: fileInfo.createdAt,
              updatedAt: fileInfo.createdAt,
              type: 'file' as const,
            },
          ])
        }
      },
    )
    if (count > 0) {
      toast.success(`${count} file${count > 1 ? 's' : ''} uploaded`)
      router.invalidate()
      if (!setItems) await onUploadComplete()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Drag and drop files or click to browse.
            {fileSizeLimit
              ? ` Max file size: ${formatFileSize(fileSizeLimit)}.`
              : ''}
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            'rounded-lg border-2 border-dashed p-8 text-center transition-colors',
            isDragging ? 'border-primary' : 'border-border',
          )}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-3">
            <Upload className="text-muted-foreground h-8 w-8" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Drop files here</p>
              <p className="text-muted-foreground text-xs">Click to browse</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Files
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleInputChange}
            aria-label="Select files to upload"
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="max-h-40 overflow-y-auto rounded-md border">
            <ul className="divide-y">
              {selectedFiles.map((file, i) => (
                <li
                  key={`${file.name}-${file.lastModified}-${i}`}
                  className="flex items-center justify-between p-2 text-sm"
                >
                  <span className="truncate">{file.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 shrink-0"
                    onClick={() =>
                      setSelectedFiles((f) => f.filter((_, idx) => idx !== i))
                    }
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
          <Button onClick={handleUpload} disabled={selectedFiles.length === 0}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
