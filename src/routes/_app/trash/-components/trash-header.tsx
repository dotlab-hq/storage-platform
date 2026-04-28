'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Trash2, RotateCcw, AlertTriangle, ArrowUpNarrowWide, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

type TrashHeaderProps = {
  onRestoreAll: () => void
  onEmptyTrash: () => void
  itemCount: number
  breadcrumbPath: Array<{ id: string; name: string }>
  onNavigateUp: () => void
}

export function TrashHeader({
  onRestoreAll,
  onEmptyTrash,
  itemCount,
  breadcrumbPath,
  onNavigateUp,
}: TrashHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Trash2 className="text-muted-foreground h-4 w-4" />
        <h1 className="text-sm font-semibold">Trash</h1>
        {breadcrumbPath.length > 0 && (
          <>
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={onNavigateUp}
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              {breadcrumbPath.map((folder) => (
                <span key={folder.id} className="flex items-center gap-1">
                  <Separator orientation="vertical" className="h-3" />
                  <span className="truncate max-w-[150px]">{folder.name}</span>
                </span>
              ))}
            </nav>
          </>
        )}
      </div>
      {itemCount > 0 && (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onRestoreAll}>
            <RotateCcw className="mr-1 h-3 w-3" />
            Restore all
          </Button>
          <Button size="sm" variant="destructive" onClick={onEmptyTrash}>
            <AlertTriangle className="mr-1 h-3 w-3" />
            Empty trash
          </Button>
        </div>
      )}
    </header>
  )
}
