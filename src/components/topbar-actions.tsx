'use client'

import * as React from 'react'
import { Plus, FilePlus, FolderPlus, Upload, FolderUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileUploadDialog } from '@/components/storage/upload-dialog'
import { FolderUploadDialog } from '@/components/storage/folder-upload-dialog'
import { NewFolderDialog } from '@/components/storage/new-folder-dialog'

import { WebRTCToggle } from '@/components/webrtc-toggle'
import { TopbarSearch } from '@/components/topbar-search'
import type { StorageItem, UploadingFile } from '@/types/storage'

type TopbarActionsProps = {
  userId: string | null
  currentFolderId: string | null
  setUploads: React.Dispatch<React.SetStateAction<UploadingFile[]>>
  onUploadComplete: () => Promise<void> | void
  onNewFile: () => void
  onNewFolder: (name: string) => Promise<void> | void
  onSearch?: (results: StorageItem[] | null) => void
  setItems?: React.Dispatch<React.SetStateAction<StorageItem[]>>
  fileSizeLimit?: number | null
  isReadOnly?: boolean
  openUploadFiles?: boolean
  onOpenUploadFilesChange?: (open: boolean) => void
  openUploadFolder?: boolean
  onOpenUploadFolderChange?: (open: boolean) => void
}

export function TopbarActions({
  userId,
  currentFolderId,
  setUploads,
  onUploadComplete,
  onNewFile,
  onNewFolder,
  onSearch,
  setItems,
  fileSizeLimit,
  openUploadFiles: controlledUploadFilesOpen,
  onOpenUploadFilesChange,
  openUploadFolder: controlledUploadFolderOpen,
  onOpenUploadFolderChange,
}: TopbarActionsProps) {
  const [uncontrolledUploadFilesOpen, setUncontrolledUploadFilesOpen] =
    React.useState(false)
  const [uncontrolledUploadFolderOpen, setUncontrolledUploadFolderOpen] =
    React.useState(false)
  const [newFolderOpen, setNewFolderOpen] = React.useState(false)

  const uploadFilesOpen =
    controlledUploadFilesOpen ?? uncontrolledUploadFilesOpen
  const setUploadFilesOpen =
    onOpenUploadFilesChange ?? setUncontrolledUploadFilesOpen
  const uploadFolderOpen =
    controlledUploadFolderOpen ?? uncontrolledUploadFolderOpen
  const setUploadFolderOpen =
    onOpenUploadFolderChange ?? setUncontrolledUploadFolderOpen

  React.useEffect(() => {
    const openUploadFile = () => {
      if (onOpenUploadFilesChange) onOpenUploadFilesChange(true)
      else setUncontrolledUploadFilesOpen(true)
    }
    const openUploadFolder = () => {
      if (onOpenUploadFolderChange) onOpenUploadFolderChange(true)
      else setUncontrolledUploadFolderOpen(true)
    }
    const openNewFolder = () => setNewFolderOpen(true)
    window.addEventListener('dot:open-upload', openUploadFile)
    window.addEventListener('dot:open-upload-folder', openUploadFolder)
    window.addEventListener('dot:open-new-folder', openNewFolder)
    return () => {
      window.removeEventListener('dot:open-upload', openUploadFile)
      window.removeEventListener('dot:open-upload-folder', openUploadFolder)
      window.removeEventListener('dot:open-new-folder', openNewFolder)
    }
  }, [onOpenUploadFilesChange, onOpenUploadFolderChange])

  return (
    <div className="flex items-center gap-2">
      <TopbarSearch userId={userId} onSearch={onSearch} />
      <WebRTCToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline" aria-label="Create or upload">
            <Plus className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onNewFile}>
            <FilePlus className="mr-2 h-4 w-4" />
            Create New File
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setUploadFilesOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setUploadFolderOpen(true)}>
            <FolderUp className="mr-2 h-4 w-4" />
            Upload Folder
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setNewFolderOpen(true)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <FileUploadDialog
        open={uploadFilesOpen}
        onOpenChange={setUploadFilesOpen}
        userId={userId}
        currentFolderId={currentFolderId}
        setUploads={setUploads}
        onUploadComplete={onUploadComplete}
        setItems={setItems}
        fileSizeLimit={fileSizeLimit}
      />
      <FolderUploadDialog
        open={uploadFolderOpen}
        onOpenChange={setUploadFolderOpen}
        userId={userId}
        currentFolderId={currentFolderId}
        setUploads={setUploads}
        onUploadComplete={onUploadComplete}
      />
      <NewFolderDialog
        open={newFolderOpen}
        onOpenChange={setNewFolderOpen}
        onConfirm={onNewFolder}
      />
    </div>
  )
}
