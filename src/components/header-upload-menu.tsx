'use client'

import * as React from 'react'
import { Plus, Upload, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileUploadDialog } from '@/components/storage/upload-dialog'
import { UrlImportDialog } from '@/components/storage/url-import-dialog'
import type { StorageItem } from '@/types/storage'

type HeaderUploadMenuProps = {
  userId: string | null
  onUploadComplete: () => Promise<void> | void
  currentFolderId?: string | null
  setItems?: React.Dispatch<React.SetStateAction<StorageItem[]>>
}

export function HeaderUploadMenu({
  userId,
  onUploadComplete,
  currentFolderId = null,
  setItems,
}: HeaderUploadMenuProps) {
  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [urlImportOpen, setUrlImportOpen] = React.useState(false)

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
        onImportComplete={onUploadComplete}
      />
    </>
  )
}
