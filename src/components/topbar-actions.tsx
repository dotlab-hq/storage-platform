import { FolderPlus, FolderUp, Link, Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUiStore } from '@/stores/ui-store'

/** The "+" menu in the file browser header. Opens dialogs via the UI store. */
export function TopbarActions({ isReadOnly = false }: { isReadOnly?: boolean }) {
  const ui = useUiStore.getState()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          aria-label="Create or upload"
          disabled={isReadOnly}
          title={isReadOnly ? 'This session is read-only' : undefined}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => ui.setUploadFilesOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Files
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => ui.setUploadFolderOpen(true)}>
          <FolderUp className="mr-2 h-4 w-4" />
          Upload Folder
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => ui.setUrlImportOpen(true)}>
          <Link className="mr-2 h-4 w-4" />
          Import from URL
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => ui.setNewFolderOpen(true)}>
          <FolderPlus className="mr-2 h-4 w-4" />
          New Folder
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
