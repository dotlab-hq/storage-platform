'use client'

import * as React from 'react'
import { Globe, Plus, Upload, FilePlus, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UploadDialog } from '@/components/storage/upload-dialog'
import { NewFolderDialog } from '@/components/storage/new-folder-dialog'
import { UrlImportDialog } from '@/components/storage/url-import-dialog'
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
}: TopbarActionsProps) {
  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [newFolderOpen, setNewFolderOpen] = React.useState(false)
  const [urlImportOpen, setUrlImportOpen] = React.useState(false)

  React.useEffect(() => {
    const openUpload = () => setUploadOpen(true)
    const openNewFolder = () => setNewFolderOpen(true)
    window.addEventListener('dot:open-upload', openUpload)
    window.addEventListener('dot:open-new-folder', openNewFolder)
    return () => {
      window.removeEventListener('dot:open-upload', openUpload)
      window.removeEventListener('dot:open-new-folder', openNewFolder)
    }
  }, [])

  return (
    <div className="flex items-center gap-2">
      <TopbarSearch userId={userId} onSearch={onSearch} />
      <WebRTCToggle />
      <Button
        size="icon"
        variant="outline"
        aria-label="Import from internet"
        onClick={() => setUrlImportOpen(true)}
      >
        <Globe className="h-4 w-4" />
      </Button>
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
          <DropdownMenuItem onSelect={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setNewFolderOpen(true)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        userId={userId}
        currentFolderId={currentFolderId}
        setUploads={setUploads}
        onUploadComplete={onUploadComplete}
        setItems={setItems}
        fileSizeLimit={fileSizeLimit}
      />
      <NewFolderDialog
        open={newFolderOpen}
        onOpenChange={setNewFolderOpen}
        onConfirm={onNewFolder}
      />
      <UrlImportDialog
        open={urlImportOpen}
        onOpenChange={setUrlImportOpen}
        currentFolderId={currentFolderId}
        onImportComplete={onUploadComplete}
      />
    </div>
  )
}
