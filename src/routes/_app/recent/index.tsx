import { useCallback, useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Clock, Folder, FileText } from 'lucide-react'
import { formatRelativeTime } from '@/lib/file-utils'
import { toast } from '@/components/ui/sonner'
import { encodeNavToken } from '@/lib/nav-token'
import { useShellView } from '@/components/shell/shell-actions-registry'
import { getRecentFileUrlFn, getRecentSnapshotFn } from './-recent-server'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'

type RecentItem = {
  id: string
  name: string
  lastOpenedAt: Date
  kind: 'file' | 'folder'
  mimeType: string | null
}

export const Route = createFileRoute('/_app/recent/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  component: RecentPage,
  loader: () => getRecentSnapshotFn(),
})

function RecentPage() {
  const navigate = useNavigate()
  const initial = Route.useLoaderData()
  const items = useMemo<RecentItem[]>(
    () =>
      initial.items.map((item) => ({
        ...item,
        lastOpenedAt: new Date(item.lastOpenedAt),
      })),
    [initial.items],
  )
  const recentActions = useMemo(
    () => ({
      commandActions: [],
      contextActions: [],
    }),
    [],
  )
  useShellView('recent', recentActions)

  const handleItemClick = useCallback(
    async (item: RecentItem) => {
      if (item.kind === 'folder') {
        void navigate({
          to: '/',
          search: { nav: encodeNavToken({ folderId: item.id }) },
        })
        return
      }
      try {
        const { url } = await getRecentFileUrlFn({ data: { fileId: item.id } })
        window.open(url, '_blank')
      } catch {
        toast.error('Failed to open file')
      }
    },
    [navigate],
  )

  return (
    <SidebarInset>
      <header className="flex h-14 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center gap-2">
          <Clock className="text-muted-foreground h-4 w-4" />
          <h1 className="text-sm font-semibold">Recent</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void handleItemClick(item)}
                className="hover:bg-accent/50 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors"
              >
                {item.kind === 'folder' ? (
                  <Folder className="text-muted-foreground h-4 w-4 shrink-0" />
                ) : (
                  <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                )}
                <span className="min-w-0 flex-1 truncate text-sm">
                  {item.name}
                </span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {formatRelativeTime(item.lastOpenedAt)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </SidebarInset>
  )
}

function EmptyState() {
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
