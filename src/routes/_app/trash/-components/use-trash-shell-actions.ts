import { useMemo } from 'react'
import { useShellView } from '@/components/shell/shell-actions-registry'

export function useTrashShellActions(
  handleRestoreAll: () => void,
  handleEmptyTrash: () => void,
) {
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
}
