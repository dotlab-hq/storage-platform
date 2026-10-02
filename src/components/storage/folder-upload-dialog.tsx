'use client'

import * as React from 'react'
import { FolderUp, X } from 'lucide-react'
import { classifyDroppedUploads } from '@/lib/drop-upload-classifier'
import { useUploader } from '@/hooks/use-uploader'
import type { FolderUploadSource } from '@/lib/drop-upload-classifier'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type FolderUploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Folder the folders are uploaded into (null = My Files root). */
  folderId: string | null
}

export function FolderUploadDialog({
  open,
  onOpenChange,
  folderId,
}: FolderUploadDialogProps) {
  const { uploadFolders } = useUploader(folderId)
  const folderInputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [selectedFolders, setSelectedFolders] = React.useState<
    FolderUploadSource[]
  >([])
  const [uploadError, setUploadError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setSelectedFolders([])
      setUploadError(null)
    }
  }, [open])

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

  const handleUpload = () => {
    if (selectedFolders.length === 0) {
      setUploadError('Select at least one folder.')
      return
    }
    // Close right away; progress continues in the upload widget.
    void uploadFolders(selectedFolders)
    setSelectedFolders([])
    onOpenChange(false)
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
            disabled={selectedFolders.length === 0}
          >
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
