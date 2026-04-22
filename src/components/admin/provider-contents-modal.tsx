import {
  ChevronRight,
  FileText,
  Folder,
  Loader2,
  RefreshCw,
  Trash2,
  Search,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { Separator } from '@/components/ui/separator'
import type { AdminProvider } from '@/lib/storage-provider-queries'
import { useProviderContents } from './use-provider-contents'

type ProviderContentsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: AdminProvider | null
}

function SectionShell({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border bg-background/80 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      {children}
    </section>
  )
}

function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xs">
      <Input
        placeholder="Search files and folders..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" variant="outline" size="sm" className="ml-2">
        Search
      </Button>
    </form>
  )
}

export function ProviderContentsModal({
  open,
  onOpenChange,
  provider,
}: ProviderContentsModalProps) {
  const viewer = useProviderContents(provider?.id ?? null, open)
  const prefixLabel = viewer.prefix.length > 0 ? viewer.prefix : '/'
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const breadcrumbNodes = useMemo(
    () => [{ label: 'Root', value: '' }, ...viewer.breadcrumbs],
    [viewer.breadcrumbs],
  )

  const maybeLoadMore = () => {
    const container = scrollContainerRef.current
    if (!container || !viewer.hasNextPage || viewer.isFetchingNextPage) {
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = container
    if (scrollHeight <= clientHeight) {
      void viewer.loadMore()
      return
    }

    const progress = (scrollTop + clientHeight) / scrollHeight
    if (progress >= 0.7) {
      void viewer.loadMore()
    }
  }

  useEffect(() => {
    maybeLoadMore()
  }, [
    viewer.files.length,
    viewer.folders.length,
    viewer.hasNextPage,
    viewer.isFetchingNextPage,
  ])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-5xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b bg-linear-to-br from-background via-background to-muted/20 px-6 py-5">
          <DialogTitle className="text-xl font-semibold">
            Provider contents
          </DialogTitle>
          <DialogDescription>
            Direct listing from the provider, split into folders and files.
          </DialogDescription>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-background/80 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Provider
              </p>
              <p className="truncate text-sm font-medium">
                {provider?.name ?? '-'}
              </p>
            </div>
            <div className="rounded-xl border bg-background/80 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Bucket
              </p>
              <p className="truncate text-sm font-medium">
                {provider?.bucketName ?? '-'}
              </p>
            </div>
            <div className="rounded-xl border bg-background/80 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Prefix
              </p>
              <p className="truncate text-sm font-medium">{prefixLabel}</p>
            </div>
          </div>
          <div className="mt-4 flex items-end">
            <SearchBar onSearch={(query) => viewer.setSearchQuery(query)} />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              {breadcrumbNodes.map((crumb, index) => (
                <div
                  key={`${crumb.label}-${crumb.value}`}
                  className="flex items-center gap-1"
                >
                  {index > 0 ? <ChevronRight className="h-4 w-4" /> : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => viewer.setPrefix(crumb.value)}
                  >
                    {crumb.label}
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => viewer.refresh()}
              disabled={viewer.isFetching}
            >
              {viewer.isFetching ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          {viewer.error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
              {viewer.error instanceof Error
                ? viewer.error.message
                : 'Failed to load provider contents'}
            </div>
          ) : viewer.isLoading || !viewer.contents ? (
            <div className="grid h-[calc(85vh-11rem)] gap-4 overflow-hidden md:grid-cols-2">
              <SectionShell title="Folders" count={0}>
                <div className="space-y-2">
                  <PageSkeleton variant="default" className="h-12" />
                  <PageSkeleton variant="default" className="h-12" />
                  <PageSkeleton variant="default" className="h-12" />
                  <PageSkeleton variant="default" className="h-12" />
                </div>
              </SectionShell>
              <SectionShell title="Files" count={0}>
                <div className="space-y-2">
                  <PageSkeleton variant="default" className="h-12" />
                  <PageSkeleton variant="default" className="h-12" />
                  <PageSkeleton variant="default" className="h-12" />
                  <PageSkeleton variant="default" className="h-12" />
                </div>
              </SectionShell>
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              onScroll={maybeLoadMore}
              className="grid h-[calc(85vh-11rem)] gap-4 overflow-y-auto pr-1 md:grid-cols-2"
            >
              <SectionShell title="Folders" count={viewer.folders.length}>
                <div className="space-y-2">
                  {viewer.folders.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                      No folders in this prefix.
                    </div>
                  ) : (
                    viewer.folders.map((folder) => (
                      <button
                        key={folder.prefix}
                        type="button"
                        className="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors hover:bg-muted/50"
                        onClick={() => viewer.setPrefix(folder.prefix)}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                          <Folder className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {folder.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {folder.prefix}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </SectionShell>

              <SectionShell title="Files" count={viewer.files.length}>
                <div className="space-y-2">
                  {viewer.files.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                      No files in this prefix.
                    </div>
                  ) : (
                    viewer.files.map((file) => (
                      <div
                        key={file.key}
                        className="flex items-center gap-3 rounded-xl border px-4 py-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                          <FileText className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {file.name}
                          </p>
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
                  {viewer.isFetchingNextPage ? (
                    <div className="flex items-center justify-center rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading more results...
                    </div>
                  ) : viewer.hasNextPage ? (
                    <button
                      type="button"
                      className="w-full rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/30"
                      onClick={() => {
                        void viewer.loadMore()
                      }}
                    >
                      Load more
                    </button>
                  ) : null}
                </div>
              </SectionShell>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
