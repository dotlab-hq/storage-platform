import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { SidebarInset } from '@/components/ui/sidebar'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { toast } from '@/components/ui/sonner'
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog'
import { PageHeader } from '@/components/app/page-header'
import { MetricCard, ProvidersPanel } from '@/components/admin/dashboard-panels'
import { ProviderEditorCard } from '@/components/admin/provider-editor-card'
import { ProviderContentsModal } from '@/components/admin/provider-contents-modal'
import { UsersPanel } from '@/components/admin/users-panel'
import { formatBytes } from '@/lib/format-bytes'
import type { AdminProvider } from '@/lib/storage-provider-queries'
import {
  adminProvidersQuery,
  adminSummaryQuery,
  adminUsersQuery,
} from '@/routes/_app/admin/-admin-queries'
import { AdminTabsList, parseAdminTab } from './admin-tabs'
import type { AdminTab } from './admin-tabs'
import { useAdminProviderMutations } from './use-admin-provider-mutations'
import { useProviderForm } from './use-provider-form'

const routeApi = getRouteApi('/_app/admin/')

/**
 * Admin dashboard: overview metrics, global storage providers, users, and the
 * add/edit provider form. All data is preloaded by the route loader; the open
 * tab lives in the URL (`?tab=`).
 */
export function AdminDashboardPage() {
  const tab =
    routeApi.useSearch({ select: (search) => search.tab }) ?? 'overview'
  const navigate = routeApi.useNavigate()
  const setTab = (next: AdminTab) =>
    navigate({ search: { tab: next === 'overview' ? undefined : next } })

  const { data: summary } = useSuspenseQuery(adminSummaryQuery())
  const { data: providers } = useSuspenseQuery(adminProvidersQuery())
  const { data: users } = useSuspenseQuery(adminUsersQuery())

  const providerForm = useProviderForm()
  const { saveProvider, setAvailability, deleteProvider, triggerTrashCron } =
    useAdminProviderMutations()
  const [viewingProvider, setViewingProvider] = useState<AdminProvider | null>(
    null,
  )
  const [deletingProvider, setDeletingProvider] =
    useState<AdminProvider | null>(null)

  const submitProvider = () => {
    const parsed = providerForm.parse()
    if (!parsed.ok) {
      toast.error(parsed.error)
      return
    }
    saveProvider.mutate(parsed.data, {
      onSuccess: () => {
        providerForm.reset()
        void setTab('providers')
      },
    })
  }

  const confirmDeleteProvider = () => {
    if (!deletingProvider) return
    deleteProvider.mutate(deletingProvider.id, {
      onSettled: () => setDeletingProvider(null),
    })
  }

  return (
    <SidebarInset>
      <PageHeader title="Admin Dashboard" />
      <div className="p-4">
        <Tabs
          value={tab}
          onValueChange={(value) => {
            const next = parseAdminTab(value)
            if (next) void setTab(next)
          }}
          className="w-full"
        >
          <AdminTabsList />
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard title="Providers" value={summary.providerCount} />
              <MetricCard title="Users" value={summary.userCount} />
              <MetricCard
                title="Total Used"
                value={formatBytes(summary.totalUsedStorageBytes)}
              />
            </div>
          </TabsContent>
          <TabsContent value="providers">
            <ProvidersPanel
              providers={providers}
              onToggleAvailability={(providerId, isActive) =>
                setAvailability.mutate({ providerId, isActive })
              }
              onDelete={setDeletingProvider}
              onEdit={(provider) => {
                providerForm.edit(provider)
                void setTab('add')
              }}
              onViewContents={setViewingProvider}
              onTriggerCron={() => triggerTrashCron.mutate()}
              isCronTriggering={triggerTrashCron.isPending}
            />
          </TabsContent>
          <TabsContent value="users">
            <UsersPanel users={users} />
          </TabsContent>
          <TabsContent value="add">
            <ProviderEditorCard
              form={providerForm.form}
              isEditing={providerForm.isEditing}
              isSaving={saveProvider.isPending}
              storageLimitInput={providerForm.storageLimitInput}
              fileSizeLimitInput={providerForm.fileSizeLimitInput}
              onChange={providerForm.setField}
              onStorageLimitChange={providerForm.setStorageLimitInput}
              onFileSizeLimitChange={providerForm.setFileSizeLimitInput}
              onProxyUploadsEnabledChange={providerForm.setProxyUploadsEnabled}
              onSubmit={submitProvider}
              onCancel={() => {
                providerForm.reset()
                void setTab('providers')
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {viewingProvider && (
        <ProviderContentsModal
          open
          onOpenChange={(open) => !open && setViewingProvider(null)}
          provider={viewingProvider}
        />
      )}
      {deletingProvider && (
        <ConfirmActionDialog
          open
          onOpenChange={(open) =>
            !open && !deleteProvider.isPending && setDeletingProvider(null)
          }
          title="Delete storage provider"
          description={`Delete "${deletingProvider.name}"? Providers that still hold files cannot be deleted.`}
          confirmLabel={deleteProvider.isPending ? 'Deleting...' : 'Delete'}
          confirmVariant="destructive"
          isLoading={deleteProvider.isPending}
          onConfirm={confirmDeleteProvider}
        />
      )}
    </SidebarInset>
  )
}
