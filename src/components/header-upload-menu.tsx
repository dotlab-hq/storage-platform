'use client'

import * as React from 'react'
import { createClientOnlyFn } from '@tanstack/react-start'
import { Plus, Upload, Link, X } from 'lucide-react'

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
import { FileUploadDialog } from '@/components/storage/upload-dialog'
import { UrlImportDialog } from '@/components/storage/url-import-dialog'

type HeaderUploadMenuProps = {
  userId: string | null
  onUploadComplete: () => Promise<void> | void
}

export function HeaderUploadMenu({
  userId,
  onUploadComplete,
}: HeaderUploadMenuProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [urlImportOpen, setUrlImportOpen] = React.useState(false)
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
      setUploadOpen(false)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error('Upload error:', error)
      setUploadError(errorMsg)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlImportComplete = async () => {
    await onUploadComplete()
    setUrlImportOpen(false)
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
          <DropdownMenuItem onSelect={() => setUploadOpen(true)}>
            <Upload />
            Upload Files
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setUrlImportOpen(true)}>
            <Link />
            Import from URL
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FileUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        userId={userId}
        currentFolderId={currentFolderId}
        setUploads={() => {}}
        onUploadComplete={onUploadComplete}
        setItems={setItems}
      />

      <UrlImportDialog
        open={urlImportOpen}
        onOpenChange={setUrlImportOpen}
        userId={userId}
        currentFolderId={currentFolderId}
        setItems={setItems}
        onImportComplete={handleUrlImportComplete}
      />
    </>
  )
}
