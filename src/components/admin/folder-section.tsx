import { Folder } from 'lucide-react'
import { SectionShell } from '@/components/admin/section-shell'

type Folder = {
  name: string
  prefix: string
}

type FolderSectionProps = {
  folders: Folder[]
  onFolderClick: (prefix: string) => void
}

export function FolderSection({ folders, onFolderClick }: FolderSectionProps) {
  return (
    <SectionShell title="Folders" count={folders.length}>
      <div className="space-y-2">
        {folders.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            No folders in this prefix.
          </div>
        ) : (
          folders.map((folder) => (
            <button
              key={folder.prefix}
              type="button"
              className="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors hover:bg-muted/50"
              onClick={() => onFolderClick(folder.prefix)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <Folder className="h-5 w-5 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{folder.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {folder.prefix}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </SectionShell>
  )
}
