'use client'

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { createClientOnlyFn } from '@tanstack/react-start'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { searchItemsFn } from '@/lib/storage/queries/server'
import type { StorageItem } from '@/types/storage'

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
}

const searchOnClient = createClientOnlyFn(async (query: string) => {
  const data = await searchItemsFn({ data: { query } })
  return data as unknown as SearchResult
})

type TopbarSearchProps = {
  userId: string | null
  onSearch?: (results: StorageItem[] | null) => void
}

export function TopbarSearch({ userId, onSearch }: TopbarSearchProps) {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const closeSearch = React.useCallback(() => {
    setSearchOpen(false)
    setSearchQuery('')
    onSearch?.(null)
  }, [onSearch])

  const handleSearchChange = React.useCallback(
    (value: string) => {
      setSearchQuery(value)
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      if (!value.trim()) {
        onSearch?.(null)
        return
      }

      debounceRef.current = setTimeout(() => {
        if (!userId) {
          return
        }
        void searchOnClient(value.trim()).then((data) => {
          const items: StorageItem[] = [
            ...(data.folders ?? []).map((folder) => ({
              ...folder,
              type: 'folder' as const,
              userId,
              parentFolderId: folder.parentFolderId ?? null,
              createdAt: new Date(folder.createdAt),
              updatedAt: new Date(folder.createdAt),
            })),
            ...(data.files ?? []).map((file) => ({
              ...file,
              type: 'file' as const,
              userId,
              objectKey: file.objectKey ?? '',
              mimeType: file.mimeType ?? null,
              folderId: null,
              createdAt: new Date(file.createdAt),
              updatedAt: new Date(file.createdAt),
            })),
          ]
          onSearch?.(items)
        })
      }, 300)
    },
    [onSearch, userId],
  )

  if (searchOpen) {
    return (
      <div className="flex items-center gap-1">
        <Input
          value={searchQuery}
          onChange={(event) => handleSearchChange(event.target.value)}
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
    )
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => setSearchOpen(true)}
      aria-label="Search"
    >
      <Search className="h-4 w-4" />
    </Button>
  )
}
