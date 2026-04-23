import { FileText, Loader2 } from 'lucide-react'
import { SectionShell } from '@/components/admin/section-shell'

type FileItem = {
  key: string
  name: string
  sizeInBytes: number
  lastModified?: string | null
}

type FileSectionProps = {
  files: FileItem[]
  isFetchingNextPage: boolean
  hasNextPage: boolean
  onLoadMore: () => void
}

export function FileSection({
  files,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
}: FileSectionProps) {
  return (
    <SectionShell title="Files" count={files.length}>
      <div className="space-y-2">
        {files.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            No files in this prefix.
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.key}
              className="flex items-center gap-3 rounded-xl border px-4 py-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {file.key}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{file.sizeInBytes.toLocaleString()} bytes</p>
                <p>{file.lastModified ?? '-'}</p>
              </div>
            </div>
          ))
        )}
        {isFetchingNextPage && (
          <div className="flex items-center justify-center rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading more results...
          </div>
        )}
        {!isFetchingNextPage && hasNextPage && (
          <button
            type="button"
            className="w-full rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/30"
            onClick={onLoadMore}
          >
            Load more
          </button>
        )}
      </div>
    </SectionShell>
  )
}
