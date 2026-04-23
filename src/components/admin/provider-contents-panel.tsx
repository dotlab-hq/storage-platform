import { useEffect, useMemo, useRef } from 'react'
import { ChevronRight, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { SectionShell } from '@/components/admin/section-shell'
import { FolderSection } from '@/components/admin/folder-section'
import { FileSection } from '@/components/admin/file-section'
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
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
          <div className="grid gap-4 md:grid-cols-2">
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
          <div className="grid gap-4 md:grid-cols-2">
            <FolderSection
              folders={viewer.folders}
              onFolderClick={viewer.setPrefix}
            />
            <FileSection
              files={viewer.files}
              isFetchingNextPage={viewer.isFetchingNextPage}
              hasNextPage={viewer.hasNextPage}
              onLoadMore={() => void viewer.loadMore()}
            />
          </div>
        )}
      </div>
    </div>
  )
}
