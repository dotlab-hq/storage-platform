'use client'

import * as React from 'react'
import { createClientOnlyFn } from '@tanstack/react-start'
import { Plus, Upload, X } from 'lucide-react'

import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type HeaderUploadMenuProps = {
  userId: string | null
  onUploadComplete: () => Promise<void> | void
}

export function HeaderUploadMenu({
  userId,
  onUploadComplete,
}: HeaderUploadMenuProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])

  const dedupeAndAppendFiles = React.useCallback((incoming: File[]) => {
    setSelectedFiles((current) => {
      const existing = new Set(
        current.map((file) => `${file.name}-${file.size}-${file.lastModified}`),
      )

      const additions = incoming.filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`
        return !existing.has(key)
      })

      return [...current, ...additions]
    })
  }, [])

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(event.dataTransfer.files)
    if (droppedFiles.length > 0) {
      dedupeAndAppendFiles(droppedFiles)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = event.target.files ? Array.from(event.target.files) : []
    if (inputFiles.length > 0) {
      dedupeAndAppendFiles(inputFiles)
    }
    event.target.value = ''
  }

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles((current) =>
      current.filter((_, index) => index !== indexToRemove),
    )
  }

  const uploadFiles = createClientOnlyFn(
    async (files: File[], currentUserId: string) => {
      const errors: string[] = []
      for (const file of files) {
        try {
          console.log(`Uploading file: ${file.name} (${file.size} bytes)`)
          const formData = new FormData()
          formData.append('userId', currentUserId)
          formData.append('file', file)

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          const responseData = (await response.json()) as {
            file?: unknown
            error?: string
          }

          if (!response.ok) {
            throw new Error(responseData.error || `HTTP ${response.status}`)
          }

          const result = responseData.file
          console.log(`Successfully uploaded: ${file.name}`, result)
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error)
          const errorMsg =
            error instanceof Error ? error.message : String(error)
          errors.push(`${file.name}: ${errorMsg}`)
        }
      }
      if (errors.length > 0) {
        throw new Error(`Upload failed: ${errors.join(', ')}`)
      }
    },
  )

  const resolveUserId = createClientOnlyFn(
    async (incomingUserId: string | null) => {
      if (incomingUserId) {
        return incomingUserId
      }

      const { data } = await authClient.getSession()
      return data?.user?.id ?? null
    },
  )

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadError('Select at least one file first.')
      return
    }

    setUploadError(null)
    setIsUploading(true)
    try {
      const currentUserId = await resolveUserId(userId)

      if (!currentUserId) {
        setUploadError('Session not ready. Please try again.')
        setIsUploading(false)
        return
      }

      await uploadFiles(selectedFiles, currentUserId)
      setSelectedFiles([])
      await onUploadComplete()
      setOpen(false)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error('Upload error:', error)
      setUploadError(errorMsg)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline" aria-label="Create or upload">
            <Plus />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            <Upload />
            Upload Files
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Drag and drop files here, or use the upload button.
            </DialogDescription>
          </DialogHeader>

          <div
            className={`rounded-lg border border-dashed p-6 text-center ${
              isDragging ? 'bg-muted' : ''
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <p className="text-sm">Drag and drop files in this space</p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => inputRef.current?.click()}
            >
              Upload
            </Button>
            <input
              ref={inputRef}
              type="file"
              multiple
              title="Upload files"
              aria-label="Upload files"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>

          <div className="max-h-56 overflow-y-auto rounded-md border">
            {selectedFiles.length === 0 ? (
              <p className="text-muted-foreground p-3 text-sm">
                No files selected.
              </p>
            ) : (
              <ul className="divide-y">
                {selectedFiles.map((file, index) => (
                  <li
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="flex items-center justify-between gap-3 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {file.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DialogFooter>
            {uploadError ? (
              <p className="text-destructive mr-auto text-sm">{uploadError}</p>
            ) : null}
            <Button type="button" onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Selected'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
