'use client'

import * as React from 'react'
import { useRouter } from '@tanstack/react-router'
import { createClientOnlyFn } from '@tanstack/react-start'
import { FolderUp, X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { uploadFolder, uploadFolderFromFiles } from '@/lib/folder-upload-utils'
import { classifyDroppedUploads } from '@/lib/drop-upload-classifier'
import { runScheduledFolderUploads } from '@/lib/folder-upload-scheduler'
import type { FolderUploadSource } from '@/lib/drop-upload-classifier'
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
    FolderUploadSource[]
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
      const { folders: sources } = classifyDroppedUploads(e.dataTransfer)

      if (sources.length > 0) {
        setSelectedFolders((prev) => [...prev, ...sources])
      }
    },
    [],
  )

  const handleInputChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : []
      if (files.length === 0) {
        e.target.value = ''
        return
      }

      // Group files by their root folder (first segment of webkitRelativePath)
      const groups = new Map<
        string,
        Array<{ file: File; relativePath: string }>
      >()
      for (const file of files) {
        const fullPath = file.webkitRelativePath || file.name
        const slashIdx = fullPath.indexOf('/')
        const rootFolderName =
          slashIdx === -1 ? fullPath : fullPath.slice(0, slashIdx)
        const relativePath =
          slashIdx === -1 ? file.name : fullPath.slice(slashIdx + 1)
        const list = groups.get(rootFolderName) ?? []
        list.push({ file, relativePath })
        groups.set(rootFolderName, list)
      }

      const newSources: FolderUploadSource[] = []
      for (const [folderName, fileList] of groups.entries()) {
        newSources.push({ type: 'files', folderName, files: fileList })
      }

      if (newSources.length > 0) {
        setSelectedFolders((prev) => [...prev, ...newSources])
      }
      e.target.value = ''
    },
    [],
  )

  const removeFolder = (index: number) => {
    setSelectedFolders((prev) => prev.filter((_, i) => i !== index))
  }

  const processFolder = React.useCallback(
    async (
      folder: FolderUploadSource,
      uid: string,
      fileConcurrency: number,
    ) => {
      if (folder.type === 'entry') {
        return await uploadFolder(
          folder.entry,
          uid,
          currentFolderId,
          setUploads,
          { fileConcurrency },
        )
      } else {
        return await uploadFolderFromFiles({
          folderName: folder.folderName,
          files: folder.files,
          userId: uid,
          parentFolderId: currentFolderId,
          setUploads,
          options: { fileConcurrency },
        })
      }
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

    let uploadedCount = 0
    let failedCount = 0

    const results = await runScheduledFolderUploads({
      sources: selectedFolders,
      uploadFolder: (source, fileConcurrency) =>
        processFolder(source, uid, fileConcurrency),
    })

    for (const result of results) {
      if (result.success && result.filesCount) {
        uploadedCount++
        toast.success(
          `Folder "${result.folderName}" uploaded with ${result.filesCount} files`,
        )
        continue
      }

      failedCount++
      toast.error(
        `Folder upload failed: ${result.error ?? 'Unknown error occurred'}`,
      )
    }

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
                  <span className="truncate">
                    {folder.type === 'entry'
                      ? folder.entry.name
                      : folder.folderName}
                  </span>
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
