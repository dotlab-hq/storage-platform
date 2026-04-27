'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatBytes } from '@/lib/format-bytes'
import { Badge } from '@/components/ui/badge'
import { BreadcrumbNav } from '@/components/storage/breadcrumb-nav'
import { FileGrid } from '@/components/storage/file-grid'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { useUserContents } from './use-user-contents'
import type { AdminUser } from '@/lib/storage-provider-queries'

type UserFilesModalProps = {
  user: AdminUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserFilesModal({
  user,
  open,
  onOpenChange,
}: UserFilesModalProps) {
  const [activeTab, setActiveTab] = useState('explorer')
  const contents = useUserContents(user.id, open && activeTab === 'explorer')

  const handleNavigate = (folderId: string | null) => {
    contents.openFolder(folderId)
  }

  const handleDoubleClick = (
    item: Parameters<typeof contents.openFolder>[0],
  ) => {
    if (item.type === 'folder') {
      contents.openFolder(item.id)
    }
  }

  const handleContextAction = (
    _action: string,
    _item: Parameters<typeof contents.openFolder>[0],
  ) => {
    // Admin read-only: allow download/copy-link only if needed
    // For now, pass through or disable
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[94vh] w-[min(98vw,1540px)] max-w-[1540px] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b bg-linear-to-br from-background via-background to-muted/20 px-6 py-5">
          <DialogTitle className="text-xl font-semibold">
            {user.name}'s Files
          </DialogTitle>
          <DialogDescription>
            Browse files and folders as administrator
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="explorer">Explorer</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="explorer" className="flex-1 m-0 overflow-hidden">
            <div className="flex h-full flex-col overflow-hidden p-6">
              {/* Breadcrumbs */}
              <div className="mb-4 shrink-0">
                <BreadcrumbNav
                  items={contents.breadcrumbs}
                  onNavigate={handleNavigate}
                />
              </div>

              {/* File content area */}
              <div className="min-h-0 flex-1 overflow-y-auto">
                {contents.isLoading && contents.items.length === 0 ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border p-4">
                      <div className="mb-3 h-5 w-32">
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
                  <FileGrid
                    items={contents.items}
                    uploads={[]}
                    isLoading={contents.isLoading}
                    selectedIds={new Set<string>()}
                    onDoubleClick={handleDoubleClick}
                    onContextAction={handleContextAction}
                    onLoadMore={contents.loadMore}
                    hasMore={contents.hasNextPage}
                    isReadOnly={true}
                    isTrash={false}
                  />
                )}
              </div>

              {/* Loading indicator for pagination */}
              {contents.isFetchingNextPage && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading more...
                  </span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="info" className="flex-1 m-0 overflow-hidden">
            <div className="h-full overflow-y-auto p-6">
              <div className="mx-auto max-w-2xl space-y-6">
                <section className="rounded-2xl border bg-card p-6">
                  <h3 className="mb-4 text-lg font-semibold">User Details</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Name</dt>
                      <dd className="font-medium">{user.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Email</dt>
                      <dd className="font-medium">{user.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Role</dt>
                      <dd>
                        <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd>
                        <Badge
                          variant={user.banned ? 'destructive' : 'default'}
                        >
                          {user.banned ? 'Banned' : 'Active'}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Joined</dt>
                      <dd className="font-medium">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-2xl border bg-card p-6">
                  <h3 className="mb-4 text-lg font-semibold">Storage Quota</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Used</dt>
                      <dd className="font-medium">
                        {formatBytes(user.usedStorage)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Allocated</dt>
                      <dd className="font-medium">
                        {formatBytes(user.storageLimitBytes)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Remaining</dt>
                      <dd className="font-medium">
                        {formatBytes(
                          Math.max(
                            0,
                            user.storageLimitBytes - user.usedStorage,
                          ),
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Usage</dt>
                      <dd className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${Math.min(100, (user.usedStorage / user.storageLimitBytes) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {(
                              (user.usedStorage / user.storageLimitBytes) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
