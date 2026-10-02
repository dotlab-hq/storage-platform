import { getRouteApi } from '@tanstack/react-router'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { Clock, FileText, Folder, Loader2 } from 'lucide-react'
import { SidebarInset } from '@/components/ui/sidebar'
import { PageHeader } from '@/components/app/page-header'
import { toast } from '@/components/ui/sonner'
import { encodeNavToken } from '@/lib/nav-token'
import { getRecentFileUrlFn } from './-recent-server'
import type { RecentItem } from './-recent-server'
import { recentItemsQuery } from './recent-query'
import { RecentTimestamp } from './recent-timestamp'

const routeApi = getRouteApi('/_app/recent/')

export const RECENT_ROW_CLASS =
  'flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left'

/** "Recent": folders and files touched in the last 24 hours. */
export function RecentPage() {
  const navigate = routeApi.useNavigate()
  const { data: items } = useSuspenseQuery(recentItemsQuery())

  const openFile = useMutation({
    mutationFn: (fileId: string) => getRecentFileUrlFn({ data: { fileId } }),
    onSuccess: ({ url }) => window.open(url, '_blank', 'noopener'),
    onError: () => toast.error('Failed to open file'),
  })

  const openItem = (item: RecentItem) => {
    if (item.kind === 'folder') {
      void navigate({
        to: '/',
        search: { nav: encodeNavToken({ folderId: item.id }) },
      })
      return
    }
    openFile.mutate(item.id)
  }

  return (
    <SidebarInset>
      <PageHeader
        title="Recent"
        icon={<Clock className="text-muted-foreground h-4 w-4" />}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {items.length === 0 ? (
          <RecentEmptyState />
        ) : (
          <div className="space-y-1">
            {items.map((item) => {
              const isOpening =
                openFile.isPending && openFile.variables === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openItem(item)}
                  disabled={item.kind === 'file' && openFile.isPending}
                  className={`${RECENT_ROW_CLASS} hover:bg-accent/50 transition-colors disabled:opacity-60`}
                >
                  <RecentItemIcon item={item} isOpening={isOpening} />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {item.name}
                  </span>
                  <RecentTimestamp iso={item.lastOpenedAt} />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </SidebarInset>
  )
}

function RecentItemIcon({
  item,
  isOpening,
}: {
  item: RecentItem
  isOpening: boolean
}) {
  const className = 'text-muted-foreground h-4 w-4 shrink-0'
  if (isOpening) return <Loader2 className={`${className} animate-spin`} />
  if (item.kind === 'folder') return <Folder className={className} />
  return <FileText className={className} />
}

function RecentEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-muted mb-4 rounded-full p-4">
        <Clock className="text-muted-foreground h-8 w-8" />
      </div>
      <h3 className="text-foreground mb-1 text-sm font-medium">
        No recent files
      </h3>
      <p className="text-muted-foreground text-sm">
        Files you open or edit will show up here
      </p>
    </div>
  )
}
