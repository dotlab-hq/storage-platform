'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Files, Folder, HardDrive } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatBytes } from '@/lib/format-bytes'
import type { FolderStatsData } from '@/routes/-home-server'

async function loadGetFolderStatsFn() {
  const mod = await import('@/routes/-home-server')
  return mod.getFolderStatsFn
}

interface FolderStatsPanelProps {
  folderId: string | null
  className?: string
}

export function FolderStatsPanel({
  folderId,
  className,
}: FolderStatsPanelProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['folder-stats', folderId],
    queryFn: async () => {
      const fn = await loadGetFolderStatsFn()
      return fn({ data: { folderId } })
    },
  })

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-sm text-muted-foreground">
          Failed to load folder stats
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <HardDrive className="h-4 w-4" />
          Current Folder Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2">
          <Files className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Files</p>
            <p className="text-sm font-semibold">{data.fileCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Folders</p>
            <p className="text-sm font-semibold">{data.folderCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Used</p>
            <p className="text-sm font-semibold">
              {formatBytes(data.storageUsed)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
