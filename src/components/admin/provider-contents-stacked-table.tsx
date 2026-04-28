import { FileText, Folder, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatBytes } from '@/lib/format-bytes'

type FolderItem = {
  name: string
  prefix: string
}

type FileItem = {
  key: string
  name: string
  sizeInBytes: number
  lastModified?: string | null
}

type ProviderContentsStackedTableProps = {
  folders: FolderItem[]
  files: FileItem[]
  isFetchingNextPage: boolean
  hasNextPage: boolean
  onLoadMore: () => void
  onFolderClick: (prefix: string) => void
}

function TruncatedWithTooltip({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={className} title={value}>
            {value}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-120 break-all">{value}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function formatLastModified(value?: string | null): string {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

export function ProviderContentsStackedTable({
  folders,
  files,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onFolderClick,
}: ProviderContentsStackedTableProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border bg-background/60">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Folders ({folders.length})</h3>
        </div>
        {folders.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No folders in this prefix.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {folders.map((folder) => (
                <TableRow key={folder.prefix}>
                  <TableCell className="max-w-[20rem]">
                    <div className="flex min-w-0 items-center gap-2">
                      <Folder className="h-4 w-4 shrink-0 text-amber-500" />
                      <TruncatedWithTooltip
                        value={folder.name}
                        className="line-clamp-1 break-all font-medium"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <TruncatedWithTooltip
                      value={folder.prefix}
                      className="line-clamp-1 break-all text-muted-foreground"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onFolderClick(folder.prefix)}
                    >
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="rounded-2xl border bg-background/60">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Files ({files.length})</h3>
        </div>
        {files.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No files in this prefix.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Object Key</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Last Modified</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.key}>
                  <TableCell className="max-w-[20rem]">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-sky-500" />
                      <TruncatedWithTooltip
                        value={file.name}
                        className="line-clamp-1 break-all font-medium"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <TruncatedWithTooltip
                      value={file.key}
                      className="line-clamp-1 break-all text-muted-foreground"
                    />
                  </TableCell>
                  <TableCell>{formatBytes(file.sizeInBytes)}</TableCell>
                  <TableCell>{formatLastModified(file.lastModified)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="border-t px-4 py-3">
          {isFetchingNextPage ? (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading more results...
            </div>
          ) : hasNextPage ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLoadMore}
            >
              Load more
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">All results loaded.</p>
          )}
        </div>
      </section>
    </div>
  )
}
