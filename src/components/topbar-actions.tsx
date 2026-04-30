'use client'

import * as React from 'react'
import {
  Plus,
  FilePlus,
  FolderPlus,
  Upload,
  FolderUp,
  Link,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  openUrlImport?: boolean
  onOpenUrlImportChange?: (open: boolean) => void
  openNewFolder?: boolean
  onOpenNewFolderChange?: (open: boolean) => void
}

export function TopbarActions({
  userId,
  currentFolderId,
  setUploads,
  onUploadComplete,
  onNewFile,
  onNewFolder,
  setItems,
  fileSizeLimit,
  openUploadFiles: controlledUploadFilesOpen,
  onOpenUploadFilesChange,
  openUploadFolder: controlledUploadFolderOpen,
  onOpenUploadFolderChange,
  openUrlImport: controlledUrlImportOpen,
  onOpenUrlImportChange,
  openNewFolder: controlledNewFolderOpen,
  onOpenNewFolderChange,
}: TopbarActionsProps) {
  const [uncontrolledUploadFilesOpen, setUncontrolledUploadFilesOpen] =
    React.useState(false)
  const [uncontrolledUploadFolderOpen, setUncontrolledUploadFolderOpen] =
    React.useState(false)
  const [uncontrolledUrlImportOpen, setUncontrolledUrlImportOpen] =
    React.useState(false)
  const [uncontrolledNewFolderOpen, setUncontrolledNewFolderOpen] =
    React.useState(false)

  const uploadFilesOpen =
    controlledUploadFilesOpen ?? uncontrolledUploadFilesOpen
  const setUploadFilesOpen =
    onOpenUploadFilesChange ?? setUncontrolledUploadFilesOpen
  const uploadFolderOpen =
    controlledUploadFolderOpen ?? uncontrolledUploadFolderOpen
  const setUploadFolderOpen =
    onOpenUploadFolderChange ?? setUncontrolledUploadFolderOpen
  const urlImportOpen = controlledUrlImportOpen ?? uncontrolledUrlImportOpen
  const setUrlImportOpen = onOpenUrlImportChange ?? setUncontrolledUrlImportOpen
  const newFolderOpen = controlledNewFolderOpen ?? uncontrolledNewFolderOpen
  const setNewFolderOpen = onOpenNewFolderChange ?? setUncontrolledNewFolderOpen

  React.useEffect(() => {
    const openUploadFile = () => {
      if (onOpenUploadFilesChange) onOpenUploadFilesChange(true)
      else setUncontrolledUploadFilesOpen(true)
    }
    const openUploadFolder = () => {
      if (onOpenUploadFolderChange) onOpenUploadFolderChange(true)
      else setUncontrolledUploadFolderOpen(true)
    }
    const openUrlImport = () => {
      if (onOpenUrlImportChange) onOpenUrlImportChange(true)
      else setUncontrolledUrlImportOpen(true)
    }
    const openNewFolder = () => {
      if (onOpenNewFolderChange) onOpenNewFolderChange(true)
      else setUncontrolledNewFolderOpen(true)
    }
    window.addEventListener('dot:open-upload', openUploadFile)
    window.addEventListener('dot:open-upload-folder', openUploadFolder)
    window.addEventListener('dot:open-url-import', openUrlImport)
    window.addEventListener('dot:open-new-folder', openNewFolder)
    return () => {
      window.removeEventListener('dot:open-upload', openUploadFile)
      window.removeEventListener('dot:open-upload-folder', openUploadFolder)
      window.removeEventListener('dot:open-url-import', openUrlImport)
      window.removeEventListener('dot:open-new-folder', openNewFolder)
    }
  }, [
    onOpenUploadFilesChange,
    onOpenUploadFolderChange,
    onOpenUrlImportChange,
    onOpenNewFolderChange,
  ])

  return (
    <div className="flex items-center gap-2">
      {/* Add your TopbarSearch and StatsDropdown here if needed */}
      <UploadMenu
        userId={userId}
        currentFolderId={currentFolderId}
        setUploads={setUploads}
        onUploadComplete={onUploadComplete}
        onNewFile={onNewFile}
        onNewFolder={onNewFolder}
        setItems={setItems}
        fileSizeLimit={fileSizeLimit}
        uploadFilesOpen={uploadFilesOpen}
        setUploadFilesOpen={setUploadFilesOpen}
        uploadFolderOpen={uploadFolderOpen}
        setUploadFolderOpen={setUploadFolderOpen}
        urlImportOpen={urlImportOpen}
        setUrlImportOpen={setUrlImportOpen}
        newFolderOpen={newFolderOpen}
        setNewFolderOpen={setNewFolderOpen}
      />
    </div>
  )
}

type UploadMenuProps = Omit<TopbarActionsProps, 'onSearch' | 'isReadOnly'> & {
  uploadFilesOpen: boolean
  setUploadFilesOpen: (open: boolean) => void
  uploadFolderOpen: boolean
  setUploadFolderOpen: (open: boolean) => void
  urlImportOpen: boolean
  setUrlImportOpen: (open: boolean) => void
  newFolderOpen: boolean
  setNewFolderOpen: (open: boolean) => void
}

function UploadMenu({
  onNewFile,
  setUploadFilesOpen,
  setUploadFolderOpen,
  setUrlImportOpen,
  setNewFolderOpen,
}: UploadMenuProps) {
  return (
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
        <DropdownMenuItem onSelect={() => setUrlImportOpen(true)}>
          <Link className="mr-2 h-4 w-4" />
          Import from URL
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setNewFolderOpen(true)}>
          <FolderPlus className="mr-2 h-4 w-4" />
          New Folder
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
