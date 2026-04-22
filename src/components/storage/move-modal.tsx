import { useMemo, useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { Folder, Search, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buildFolderPathOptions, isDescendantFolder } from '@/lib/folder-paths'
import type { StorageItem } from '@/types/storage'
import { getAllFoldersFn } from '@/lib/storage/queries/server'

type FolderOption = { id: string; name: string; parentFolderId: string | null }
type FoldersPayload = { folders?: FolderOption[] }

const UNSELECTED = '__unselected__'

type MoveModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: StorageItem[]
  currentFolderId: string | null
  onMove: (targetFolderId: string | null) => void
  isLoading?: boolean
  userId?: string | null
  mode?: 'move' | 'update-path'
}

export function MoveModal({
  open,
  onOpenChange,
  items,
  currentFolderId,
  onMove,
  isLoading = false,
  userId,
  mode = 'move',
}: MoveModalProps) {
  const [selectedFolder, setSelectedFolder] = useState<string>(UNSELECTED)
  const [pathQuery, setPathQuery] = useState('')
  const [allFolders, setAllFolders] = useState<FolderOption[]>([])
  const [fetching, setFetching] = useState(false)
  const movingIds = new Set(items.map((i) => i.id))

  // Reset selection every time modal opens
  useEffect(() => {
    if (open) {
      setSelectedFolder(UNSELECTED)
      setPathQuery('')
    }
  }, [open])

  useEffect(() => {
    if (!open || !userId) return
    setFetching(true)
    void getAllFoldersFn()
      .then((data: FoldersPayload) => setAllFolders(data.folders ?? []))
      .catch(() => setAllFolders([]))
      .finally(() => setFetching(false))
  }, [open, userId])

  const allPaths = useMemo(
    () => buildFolderPathOptions(allFolders),
    [allFolders],
  )

  const movingFolderIds = useMemo(
    () =>
      items.filter((item) => item.type === 'folder').map((folder) => folder.id),
    [items],
  )

  const availableFolders = useMemo(
    () =>
      allPaths.filter((folder) => {
        if (folder.id === currentFolderId) return false
        if (movingIds.has(folder.id)) return false
        for (const movingFolderId of movingFolderIds) {
          if (isDescendantFolder(movingFolderId, folder.id, allFolders)) {
            return false
          }
        }
        return true
      }),
    [allFolders, allPaths, currentFolderId, movingFolderIds, movingIds],
  )

  const filteredFolders = useMemo(() => {
    const query = pathQuery.trim().toLowerCase()
    if (!query) return availableFolders
    return availableFolders.filter(
      (folder) =>
        folder.path.toLowerCase().includes(query) ||
        folder.name.toLowerCase().includes(query),
    )
  }, [availableFolders, pathQuery])

  const itemLabel =
    items.length === 1
      ? `"${items[0]?.name ?? 'item'}"`
      : `${items.length} items`

  const hasSelection = selectedFolder !== UNSELECTED
  const targetId = selectedFolder === 'root' ? null : selectedFolder
  const selectedPath = targetId
    ? (availableFolders.find((folder) => folder.id === targetId)?.path ??
      'Unknown path')
    : '/'
  const isUpdatePath = mode === 'update-path'
  const actionLabel = isUpdatePath ? 'Update path' : 'Move here'
  const loadingLabel = isUpdatePath ? 'Updating...' : 'Moving...'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden sm:max-w-2xl">
        <div className="bg-primary/5 pointer-events-none absolute inset-x-0 top-0 h-24" />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary h-4 w-4" />
            {isUpdatePath
              ? `Update path for ${itemLabel}`
              : `Move ${itemLabel}`}
          </DialogTitle>
          <DialogDescription>
            Pick a destination path directly. No manual folder-by-folder
            navigation required.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="text-muted-foreground absolute left-3 top-2.5 h-4 w-4" />
          <Input
            value={pathQuery}
            onChange={(event) => setPathQuery(event.target.value)}
            placeholder="Search destination path, e.g. /Projects/2026"
            className="pl-9"
          />
        </div>
        <div className="bg-muted/40 rounded-md border px-3 py-2 text-xs">
          Destination:{' '}
          <span className="text-foreground font-medium">
            {hasSelection ? selectedPath : 'No destination selected'}
          </span>
        </div>
        <div className="max-h-72 space-y-1 overflow-y-auto rounded-md border p-2">
          {fetching ? (
            <div className="space-y-2 p-1">
              <PageSkeleton variant="default" className="h-10" />
              <PageSkeleton variant="default" className="h-10" />
              <PageSkeleton variant="default" className="h-10" />
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setSelectedFolder('root')}
                className={cn(
                  'animate-in fade-in-0 slide-in-from-bottom-2 flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm duration-200',
                  selectedFolder === 'root'
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'border-transparent hover:bg-muted',
                )}
              >
                <Folder className="h-4 w-4" />
                <span className="font-medium">/</span>
                <span className="text-muted-foreground">My Files (Root)</span>
              </button>
              {filteredFolders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setSelectedFolder(folder.id)}
                  className={cn(
                    'animate-in fade-in-0 slide-in-from-bottom-2 flex w-full items-center gap-2 rounded-md border px-3 py-2 pl-4 text-left text-sm duration-200',
                    selectedFolder === folder.id
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'border-transparent hover:bg-muted',
                  )}
                >
                  <Folder className="h-4 w-4" />
                  <span className="truncate">{folder.path}</span>
                </button>
              ))}
              {filteredFolders.length === 0 && !fetching && (
                <p className="text-muted-foreground px-3 py-4 text-center text-sm">
                  No matching destination paths.
                </p>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onMove(targetId)}
            disabled={isLoading || fetching || !hasSelection}
          >
            {isLoading ? loadingLabel : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
