import { useEffect, useMemo, useRef } from 'react'
import {
  ChevronRight,
  FileText,
  Folder,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { SearchBar } from '@/components/admin/search-bar'
import { formatBytes } from '@/lib/format-bytes'
import type { UseProviderContentsResult } from './use-provider-contents'

type ProviderContentsPanelProps = {
  viewer: UseProviderContentsResult
}

export function ProviderContentsPanel({ viewer }: ProviderContentsPanelProps) {
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
    <div className="flex-1 overflow-hidden p-6 flex flex-col">
      <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
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

          <div className="flex items-center gap-3">
            <SearchBar onSearch={(query) => viewer.setSearchQuery(query)} />
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
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={maybeLoadMore}
        className="flex-1 min-h-0 overflow-y-auto pr-1"
      >
        {viewer.error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
            {viewer.error instanceof Error
              ? viewer.error.message
              : 'Failed to load provider contents'}
          </div>
        ) : viewer.isLoading || !viewer.contents ? (
          <div className="space-y-4">
            <div className="rounded-2xl border p-4">
              <div className="mb-3 h-5 w-32">
                <PageSkeleton variant="default" className="h-5" />
              </div>
              <div className="space-y-2">
                <PageSkeleton variant="default" className="h-11" />
                <PageSkeleton variant="default" className="h-11" />
                <PageSkeleton variant="default" className="h-11" />
              </div>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="mb-3 h-5 w-24">
                <PageSkeleton variant="default" className="h-5" />
              </div>
              <div className="space-y-2">
                <PageSkeleton variant="default" className="h-11" />
                <PageSkeleton variant="default" className="h-11" />
                <PageSkeleton variant="default" className="h-11" />
                <PageSkeleton variant="default" className="h-11" />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border/60">
            <div className="flex items-center px-4 py-2.5 border-b bg-muted/30 rounded-t-lg">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Name
                </span>
              </div>
              <div className="w-28 text-right">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Size
                </span>
              </div>
              <div className="w-32 text-right">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Modified
                </span>
              </div>
            </div>
            <div className="divide-y">
              {viewer.folders.length > 0 ? (
                <div className="border-b p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Folders
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {viewer.folders.map((folder) => (
                      <button
                        key={folder.prefix}
                        type="button"
                        className="rounded-2xl border bg-background/50 p-3 text-left transition-colors hover:bg-muted/30"
                        onClick={() => viewer.setPrefix(folder.prefix)}
                      >
                        <Folder className="mb-2 h-6 w-6 text-amber-500" />
                        <p className="truncate text-sm font-semibold">
                          {folder.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {viewer.files.map((file) => (
                <div
                  key={file.key}
                  className="group flex items-center px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50">
                    <FileText className="h-5 w-5 text-sky-500" />
                  </div>
                  <div className="mr-4 min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {file.key}
                    </p>
                  </div>
                  <div className="w-28 text-right text-sm text-muted-foreground">
                    {formatBytes(file.sizeInBytes)}
                  </div>
                  <div className="w-32 text-right text-sm text-muted-foreground">
                    {file.lastModified
                      ? new Date(file.lastModified).toLocaleDateString()
                      : '-'}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
              {viewer.isFetchingNextPage ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading more...
                </span>
              ) : (
                <span>{viewer.folders.length + viewer.files.length} items</span>
              )}
              {viewer.hasNextPage && !viewer.isFetchingNextPage ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void viewer.loadMore()}
                >
                  Load more
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
