import { useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { SidebarInset } from '@/components/ui/sidebar'
import { TrashContent } from '@/components/storage/trash-content'
import { ConfirmDeleteModal } from '@/components/storage/confirm-delete-modal'
import { useShellView } from '@/components/shell/shell-actions-registry'
import { trashFolderQuery } from '@/lib/storage/trash-query'
import { useTrashActions } from '@/hooks/use-trash-actions'
import { useSelectionStore } from '@/stores/selection-store'
import type { TrashItem } from '@/lib/trash-queries'
import { TrashHeader } from './trash-header'
import { BulkActionBar } from './bulk-action-bar'

const routeApi = getRouteApi('/_app/trash/')

/** What the "delete forever" confirmation is about to delete. */
type PendingDelete =
  | { mode: 'items'; items: TrashItem[] }
  | { mode: 'empty-all' }

export function TrashPage() {
  const { path = [] } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const folderId = path.at(-1)?.id ?? null

  const { data: items } = useSuspenseQuery(trashFolderQuery(folderId))
  const trash = useTrashActions()
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)

  const selectedIds = useSelectionStore((state) => state.selectedIds)
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds],
  )

  const openFolder = (item: TrashItem) =>
    void navigate({ search: { path: [...path, { id: item.id, name: item.name }] } })

  const restoreAll = () => trash.restore(items)
  const emptyTrash = () => setPendingDelete({ mode: 'empty-all' })

  const shellActions = useMemo(
    () => ({
      commandActions: [],
      contextActions: [
        { id: 'trash-restore-all', label: 'Restore all', onSelect: restoreAll },
        {
          id: 'trash-empty',
          label: 'Empty trash',
          onSelect: emptyTrash,
          destructive: true,
        },
      ],
    }),
    // Re-register only when the listing changes (handlers read `items`).
    [items],
  )
  useShellView('trash', shellActions)

  const confirmDelete = async () => {
    if (!pendingDelete) return
    if (pendingDelete.mode === 'empty-all') await trash.emptyTrash()
    else await trash.deleteForever(pendingDelete.items)
    setPendingDelete(null)
  }

  return (
    <SidebarInset>
      <TrashHeader
        path={path}
        itemCount={items.length}
        onRestoreAll={restoreAll}
        onEmptyTrash={emptyTrash}
      />
      <BulkActionBar
        selectedCount={selectedItems.length}
        onBulkRestore={() => trash.restore(selectedItems)}
        onBulkDelete={() =>
          setPendingDelete({ mode: 'items', items: selectedItems })
        }
        onCancel={() => useSelectionStore.getState().clear()}
      />
      <TrashContent
        items={items}
        selectedIds={selectedIds}
        onToggleSelect={(id) => useSelectionStore.getState().toggle(id)}
        onRestore={(item) => trash.restore([item])}
        onDelete={(item) => setPendingDelete({ mode: 'items', items: [item] })}
        onFolderOpen={openFolder}
      />
      <ConfirmDeleteModal
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !trash.isDeleting) setPendingDelete(null)
        }}
        isPermanent
        title={pendingDelete?.mode === 'empty-all' ? 'Empty the trash?' : undefined}
        itemCount={pendingDelete?.mode === 'items' ? pendingDelete.items.length : 0}
        onConfirm={() => void confirmDelete()}
        isLoading={trash.isDeleting}
      />
    </SidebarInset>
  )
}
