'use client'

import {
  lazy,
  Suspense,
  useState,
  useMemo,
  useTransition,
  useLayoutEffect,
  useCallback,
} from 'react'
import { SidebarInset } from '@/components/ui/sidebar'
import { useTrashData } from '@/hooks/use-trash-data'
import { useFileSelectionStore } from '@/stores/file-selection-store'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { TrashHeader } from './-trash-header'
import { BulkActionBar } from './-bulk-action-bar'
import { useTrashShellActions } from './-use-trash-shell-actions'

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
  // Navigation state for folder hierarchy (must be declared before useTrashData)
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(
    undefined,
  )
  const [folderPath, setFolderPath] = useState<
    Array<{ id: string; name: string }>
  >([])

  const trash = useTrashData({ parentFolderId: currentFolderId })
  const [, startTransition] = useTransition()

  // Use Zustand store for selection (shared across components)
  const selectedIds = useFileSelectionStore((s) => s.selectedIds)
  const toggleSelect = useFileSelectionStore((s) => s.toggleSelect)
  const clearSelection = useFileSelectionStore((s) => s.clearSelection)

  // When navigating into a folder
  const handleFolderClick = useCallback(
    (folderId: string, folderName: string) => {
      startTransition(() => {
        clearSelection() // clear selection when navigating
        setCurrentFolderId(folderId)
        setFolderPath((prev) => [...prev, { id: folderId, name: folderName }])
      })
    },
    [clearSelection],
  )

  // When clicking "Up" in breadcrumb
  const handleNavigateUp = useCallback(() => {
    startTransition(() => {
      clearSelection()
      if (folderPath.length === 0) {
        setCurrentFolderId(undefined)
      } else {
        const newPath = folderPath.slice(0, -1)
        setFolderPath(newPath)
        setCurrentFolderId(newPath[newPath.length - 1]?.id)
      }
    })
  }, [folderPath, clearSelection])

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

  // Register shell actions for command palette
  useTrashShellActions(handleRestoreAll, handleEmptyTrash)

  return (
    <SidebarInset>
      <TrashHeader
        onRestoreAll={handleRestoreAll}
        onEmptyTrash={handleEmptyTrash}
        itemCount={trash.items.length}
        breadcrumbPath={folderPath}
        onNavigateUp={handleNavigateUp}
      />
      <BulkActionBar
        selectedCount={selectedCount}
        onBulkRestore={handleBulkRestore}
        onBulkDelete={handleBulkDelete}
        onCancel={clearSelection}
      />

      <Suspense fallback={<PageSkeleton className="h-96 w-full" />}>
        <TrashContent
          items={trash.items}
          isLoading={trash.isLoading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onRestore={handleRestoreOne}
          onDelete={handleDeleteOne}
          onFolderClick={handleFolderClick}
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
