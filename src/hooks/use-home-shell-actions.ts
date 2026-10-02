import { useMemo } from 'react'
import { useShellView } from '@/components/shell/shell-actions-registry'
import type { ShellAction } from '@/components/shell/shell-actions-registry'
import { useUiStore } from '@/stores/ui-store'

/** Registers the file browser's commands for Cmd/Ctrl+K and right-click. */
export function useHomeShellActions() {
  const config = useMemo(() => {
    const ui = useUiStore.getState()
    const actions: ShellAction[] = [
      { id: 'upload-files', label: 'Upload Files', onSelect: () => ui.setUploadFilesOpen(true) },
      { id: 'upload-folder', label: 'Upload Folder', onSelect: () => ui.setUploadFolderOpen(true) },
      { id: 'import-url', label: 'Import from URL', onSelect: () => ui.setUrlImportOpen(true) },
      { id: 'new-folder', label: 'New Folder', onSelect: () => ui.setNewFolderOpen(true) },
    ]
    return { commandActions: actions, contextActions: actions }
  }, [])

  useShellView('home', config)
}
