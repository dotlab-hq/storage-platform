import { useEffect, useMemo, useRef } from 'react'
import { ChevronRight, Home, Loader2, RefreshCw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { S3BucketViewerBrowser } from '@/components/storage/s3-bucket-viewer-browser'
import type { UseProviderContentsResult } from './use-provider-contents'

type ProviderContentsPanelProps = {
  viewer: UseProviderContentsResult
}

type ViewerAdapter = {
  folders: { name: string; prefix: string }[]
  files: {
    key: string
    name: string
    sizeInBytes: number
    eTag: string | null
    lastModified: string | null
  }[]
  uploadingFiles: []
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  busy: boolean
  message: string | null
  refresh: (nextPrefix?: string) => Promise<void>
  loadMore: () => Promise<void>
  openFile: (key: string) => Promise<void>
  deleteFile: (_key: string) => Promise<void>
}

function createViewerAdapter(viewer: UseProviderContentsResult): ViewerAdapter {
  return {
    folders: viewer.folders,
    files: viewer.files,
    uploadingFiles: [],
    isLoading: viewer.isLoading,
    isFetchingNextPage: viewer.isFetchingNextPage,
    hasNextPage: Boolean(viewer.hasNextPage),
    busy: viewer.isFetching,
    message: viewer.error
      ? viewer.error instanceof Error
        ? viewer.error.message
        : 'Failed to load provider contents'
      : null,
    refresh: async (nextPrefix?: string) => {
      if (typeof nextPrefix === 'string') {
        viewer.setPrefix(nextPrefix)
        return
      }
      await viewer.refresh()
    },
    loadMore: async () => {
      await viewer.loadMore()
    },
    openFile: async () => undefined,
    deleteFile: async () => undefined,
  }
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

  const adapter = createViewerAdapter(viewer)
  const totalItems = adapter.folders.length + adapter.files.length

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-6">
      <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
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
                {index === 0 ? <Home className="mr-1 h-4 w-4" /> : null}
                {crumb.label}
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search folders and files"
              className="w-[280px] pl-9"
              onChange={(event) => viewer.setSearchQuery(event.target.value)}
            />
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
      </div>

      <S3BucketViewerBrowser
        viewer={adapter}
        totalItems={totalItems}
        scrollContainerRef={scrollContainerRef}
        onScroll={maybeLoadMore}
      />
    </div>
  )
}
