'use client'

import * as React from 'react'
import { Plus, Upload, FilePlus, FolderPlus, Search, X } from 'lucide-react'
import { createClientOnlyFn } from '@tanstack/react-start'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UploadDialog } from '@/components/storage/upload-dialog'
import { NewFolderDialog } from '@/components/storage/new-folder-dialog'
import { WebRTCToggle } from '@/components/webrtc-toggle'
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

type SearchResult = {
  folders?: {
    id: string
    name: string
    createdAt: string
    parentFolderId: string | null
  }[]
  files?: {
    id: string
    name: string
    sizeInBytes: number
    mimeType?: string | null
    objectKey?: string
    createdAt: string
  }[]
  error?: string
}

import { searchItemsFn } from '@/lib/storage/queries/server'

const searchOnClient = createClientOnlyFn(async (query: string) => {
  const data = await searchItemsFn({ data: { query } })
  return data as unknown as SearchResult
})

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
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const handleSearchChange = React.useCallback(
    (value: string) => {
      setSearchQuery(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (!value.trim()) {
        onSearch?.(null)
        return
      }
      debounceRef.current = setTimeout(() => {
        if (!userId) return
        void searchOnClient(value.trim()).then((data) => {
          const items: StorageItem[] = [
            ...(data.folders ?? []).map((f) => ({
              ...f,
              type: 'folder' as const,
              userId,
              parentFolderId: f.parentFolderId ?? null,
              createdAt: new Date(f.createdAt),
              updatedAt: new Date(f.createdAt),
            })),
            ...(data.files ?? []).map((f) => ({
              ...f,
              type: 'file' as const,
              userId,
              objectKey: f.objectKey ?? '',
              mimeType: f.mimeType ?? null,
              folderId: null,
              createdAt: new Date(f.createdAt),
              updatedAt: new Date(f.createdAt),
            })),
          ]
          onSearch?.(items)
        })
      }, 300)
    },
    [userId, onSearch],
  )

  const closeSearch = React.useCallback(() => {
    setSearchOpen(false)
    setSearchQuery('')
    onSearch?.(null)
  }, [onSearch])

  return (
    <div className="flex items-center gap-2">
      {/* Search toggle */}
      {searchOpen ? (
        <div className="flex items-center gap-1">
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search files..."
            className="h-8 w-48"
            autoFocus
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={closeSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
      )}

      {/* WebRTC Toggle */}
      <WebRTCToggle />

      {/* Create menu */}
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

      {/* Upload dialog */}
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

      {/* New Folder dialog */}
      <NewFolderDialog
        open={newFolderOpen}
        onOpenChange={setNewFolderOpen}
        onConfirm={onNewFolder}
      />
    </div>
  )
}
