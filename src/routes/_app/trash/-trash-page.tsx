'use client'

import {
  lazy,
  Suspense,
  useState,
  useMemo,
  useTransition,
  useLayoutEffect,
} from 'react'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTrashData } from '@/hooks/use-trash-data'
import { useFileSelectionStore } from '@/stores/file-selection-store'
import { useShellView } from '@/components/shell/shell-actions-registry'
import { PageSkeleton } from '@/components/ui/page-skeleton'

const TrashContent = lazy(() =>
  import('@/components/storage/trash-content').then((m) => ({
    default: m.TrashContent,
  })),
)

const ConfirmDeleteModal = lazy(() =>
  import('@/components/storage/confirm-delete-modal').then((m) => ({
    default: m.ConfirmDeleteModal,
  })),
)

export function TrashPage() {
  const trash = useTrashData()
  const [, startTransition] = useTransition()

  // Use Zustand store for selection (shared across components)
  const selectedIds = useFileSelectionStore((s) => s.selectedIds)
  const toggleSelect = useFileSelectionStore((s) => s.toggleSelect)
  const clearSelection = useFileSelectionStore((s) => s.clearSelection)

  // Local UI state for delete modal (trash-specific)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{
    ids: string[]
    types: ('file' | 'folder')[]
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Clear selection on unmount via useLayoutEffect
  useLayoutEffect(() => {
    return () => clearSelection()
  }, [clearSelection])

  // Memoize selected items to avoid recomputation
  const selectedItems = useMemo(
    () => trash.items.filter((i) => selectedIds.has(i.id)),
    [trash.items, selectedIds],
  )

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds])

  const handleRestoreOne = (id: string, type: 'file' | 'folder') => {
    startTransition(() => {
      void trash.handleRestore([id], [type])
    })
  }

  const handleDeleteOne = (id: string, type: 'file' | 'folder') => {
    startTransition(() => {
      setPendingDelete({ ids: [id], types: [type] })
      setDeleteOpen(true)
    })
  }

  const handleEmptyTrash = () => {
    if (trash.items.length === 0) return
    startTransition(() => {
      setPendingDelete({
        ids: trash.items.map((i) => i.id),
        types: trash.items.map((i) => i.type),
      })
      setDeleteOpen(true)
    })
  }

  const handleRestoreAll = () => {
    if (trash.items.length === 0) return
    startTransition(() => {
      void trash.handleRestore(
        trash.items.map((i) => i.id),
        trash.items.map((i) => i.type),
      )
    })
  }

  const handleBulkRestore = () => {
    if (selectedItems.length === 0) return
    startTransition(() => {
      void trash.handleRestore(
        selectedItems.map((i) => i.id),
        selectedItems.map((i) => i.type),
      )
      clearSelection()
    })
  }

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return
    startTransition(() => {
      setPendingDelete({
        ids: selectedItems.map((i) => i.id),
        types: selectedItems.map((i) => i.type),
      })
      setDeleteOpen(true)
      clearSelection()
    })
  }

  const confirmPermanentDelete = async () => {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      await trash.handlePermanentDelete(pendingDelete.ids, pendingDelete.types)
    } finally {
      startTransition(() => {
        setIsDeleting(false)
        setDeleteOpen(false)
        setPendingDelete(null)
      })
    }
  }

  // Memoize shell actions
  const trashShellActions = useMemo(
    () => ({
      commandActions: [],
      contextActions: [
        {
          id: 'ctx-trash-restore-all',
          label: 'Restore All',
          onSelect: handleRestoreAll,
        },
        {
          id: 'ctx-trash-empty',
          label: 'Empty Trash',
          onSelect: handleEmptyTrash,
          destructive: true,
        },
      ],
    }),
    [handleRestoreAll, handleEmptyTrash],
  )
  useShellView('trash', trashShellActions)

  return (
    <SidebarInset>
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Trash2 className="text-muted-foreground h-4 w-4" />
          <h1 className="text-sm font-semibold">Trash</h1>
        </div>
        {trash.items.length > 0 && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleRestoreAll}>
              <RotateCcw className="mr-1 h-3 w-3" />
              Restore all
            </Button>
            <Button size="sm" variant="destructive" onClick={handleEmptyTrash}>
              <AlertTriangle className="mr-1 h-3 w-3" />
              Empty trash
            </Button>
          </div>
        )}
      </header>

      {selectedCount > 0 && (
        <div className="mx-4 mt-4 flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm font-medium">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleBulkRestore}>
              <RotateCcw className="mr-1 h-3 w-3" />
              Restore
            </Button>
            <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
              <AlertTriangle className="mr-1 h-3 w-3" />
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={clearSelection}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <Suspense fallback={<PageSkeleton className="h-96 w-full" />}>
        <TrashContent
          items={trash.items}
          isLoading={trash.isLoading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onRestore={handleRestoreOne}
          onDelete={handleDeleteOne}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ConfirmDeleteModal
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open)
            if (!open) setPendingDelete(null)
          }}
          isPermanent
          itemCount={pendingDelete?.ids.length ?? 1}
          onConfirm={() => void confirmPermanentDelete()}
          isLoading={isDeleting}
        />
      </Suspense>
    </SidebarInset>
  )
}
