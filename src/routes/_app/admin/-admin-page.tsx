'use client'

import { useState, lazy, Suspense } from 'react'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatBytes } from '@/lib/format-bytes'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { useQueryClient } from '@tanstack/react-query'
import type { AdminProvider, AdminUser } from '@/lib/storage-provider-queries'
import { useAdminUsers } from '@/hooks/use-admin-users'
import {
  setStorageProviderAvailabilityFn,
  deleteStorageProviderFn,
  getAdminProvidersFn,
  getAdminSummaryFn,
  saveStorageProviderFn,
} from '@/routes/_app/admin/-admin-server'

const MetricCard = lazy(() =>
  import('@/components/admin/dashboard-panels').then((m) => ({
    default: m.MetricCard,
  })),
)
const ProvidersPanel = lazy(() =>
  import('@/components/admin/dashboard-panels').then((m) => ({
    default: m.ProvidersPanel,
  })),
)
const UsersPanel = lazy(() =>
  import('@/components/admin/dashboard-panels').then((m) => ({
    default: m.UsersPanel,
  })),
)
const ProviderEditorCard = lazy(() =>
  import('@/components/admin/provider-editor-card').then((m) => ({
    default: m.ProviderEditorCard,
  })),
)
const ProviderContentsModal = lazy(() =>
  import('@/components/admin/provider-contents-modal').then((m) => ({
    default: m.ProviderContentsModal,
  })),
)
const UserFilesModal = lazy(() =>
  import('@/components/admin/user-files-modal').then((m) => ({
    default: m.UserFilesModal,
  })),
)

export type AdminDashboardData = {
  summary: {
    providerCount: number
    userCount: number
    totalUsedStorageBytes: number
  }
  providers: AdminProvider[]
  users: AdminUser[]
}

const emptyDashboardData: AdminDashboardData = {
  summary: {
    providerCount: 0,
    userCount: 0,
    totalUsedStorageBytes: 0,
  },
  providers: [],
  users: [],
}

const emptyProviderForm = {
  name: '',
  endpoint: '',
  region: '',
  bucketName: '',
  accessKeyId: '',
  secretAccessKey: '',
  storageLimitBytes: 10 * 1024 * 1024 * 1024,
  fileSizeLimitBytes: 100 * 1024 * 1024,
  proxyUploadsEnabled: false,
  isActive: true,
}

type AdminDashboardPageProps = {
  initial?: AdminDashboardData
}

type ProviderTextField =
  | 'name'
  | 'endpoint'
  | 'region'
  | 'bucketName'
  | 'accessKeyId'
  | 'secretAccessKey'

export function AdminDashboardPage({ initial }: AdminDashboardPageProps) {
  const queryClient = useQueryClient()

  const [providers, setProviders] = useState<AdminProvider[]>(
    initial?.providers ?? [],
  )
  const [summary, setSummary] = useState(
    initial?.summary ?? {
      providerCount: 0,
      userCount: 0,
      totalUsedStorageBytes: 0,
    },
  )
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState(emptyProviderForm)
  const [editingProviderId, setEditingProviderId] = useState<string | null>(
    null,
  )
  const [storageLimitInput, setStorageLimitInput] = useState(
    String(emptyProviderForm.storageLimitBytes),
  )
  const [fileSizeLimitInput, setFileSizeLimitInput] = useState(
    String(emptyProviderForm.fileSizeLimitBytes),
  )
  const [isProviderViewerOpen, setIsProviderViewerOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] =
    useState<AdminProvider | null>(null)
  const [isUserFilesModalOpen, setIsUserFilesModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const setProviderField = (field: ProviderTextField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const { data: usersData = [] } = useAdminUsers(initial?.users)

  const submitProvider = async () => {
    const parsedLimit = Number(storageLimitInput)
    const parsedFileSizeLimit = Number(fileSizeLimitInput)
    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      toast.error('Storage limit must be a positive number')
      return
    }
    if (!Number.isFinite(parsedFileSizeLimit) || parsedFileSizeLimit <= 0) {
      toast.error('File-size limit must be a positive number')
      return
    }
    if (parsedFileSizeLimit > parsedLimit) {
      toast.error('File-size limit cannot exceed storage limit')
      return
    }
    if (!form.name.trim()) {
      toast.error('Provider name is required')
      return
    }

    setIsSaving(true)

    const optimisticProviderCount = editingProviderId
      ? providers.length
      : providers.length + 1

    setSummary((prev) => ({
      ...prev,
      providerCount: optimisticProviderCount,
    }))

    const optimisticProviders = editingProviderId
      ? providers.map((provider) =>
          provider.id === editingProviderId
            ? {
                ...provider,
                name: form.name,
                region: form.region || 'pending',
                endpoint: form.endpoint || 'pending',
                bucketName: form.bucketName || 'pending',
                storageLimitBytes: parsedLimit,
                fileSizeLimitBytes: parsedFileSizeLimit,
                proxyUploadsEnabled: form.proxyUploadsEnabled,
                availableStorageBytes: parsedLimit - provider.usedStorageBytes,
              }
            : provider,
        )
      : [
          ...providers,
          {
            id: `optimistic-${Date.now()}`,
            name: form.name || 'New Provider',
            region: form.region || 'pending',
            endpoint: form.endpoint || 'pending',
            bucketName: form.bucketName || 'pending',
            storageLimitBytes: parsedLimit,
            fileSizeLimitBytes: parsedFileSizeLimit,
            proxyUploadsEnabled: form.proxyUploadsEnabled,
            isActive: true,
            createdAt: new Date(),
            usedStorageBytes: 0,
            availableStorageBytes: parsedLimit,
          },
        ]

    setProviders(optimisticProviders)

    try {
      const result = await saveStorageProviderFn({
        data: {
          providerId: editingProviderId ?? undefined,
          ...form,
          storageLimitBytes: parsedLimit,
          fileSizeLimitBytes: parsedFileSizeLimit,
          proxyUploadsEnabled: form.proxyUploadsEnabled,
          isActive: true,
        },
      })
      const [refreshedProviders, refreshedSummary] = await Promise.all([
        getAdminProvidersFn(),
        getAdminSummaryFn(),
      ])
      setProviders(refreshedProviders)
      setSummary(refreshedSummary)
      setForm(emptyProviderForm)
      setEditingProviderId(null)
      setStorageLimitInput(String(emptyProviderForm.storageLimitBytes))
      setFileSizeLimitInput(String(emptyProviderForm.fileSizeLimitBytes))
      toast.success(
        result.operation === 'updated'
          ? 'Storage provider updated'
          : 'Storage provider added',
      )
    } catch (error) {
      const [refreshedProviders, refreshedSummary] = await Promise.all([
        getAdminProvidersFn(),
        getAdminSummaryFn(),
      ])
      setProviders(refreshedProviders)
      setSummary(refreshedSummary)
      const message =
        error instanceof Error ? error.message : 'Failed to create provider'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const startEditingProvider = (provider: AdminProvider) => {
    setEditingProviderId(provider.id)
    setForm({
      name: provider.name,
      endpoint: provider.endpoint,
      region: provider.region,
      bucketName: provider.bucketName,
      accessKeyId: '',
      secretAccessKey: '',
      storageLimitBytes: provider.storageLimitBytes,
      fileSizeLimitBytes: provider.fileSizeLimitBytes,
      proxyUploadsEnabled: provider.proxyUploadsEnabled,
      isActive: provider.isActive,
    })
    setStorageLimitInput(String(provider.storageLimitBytes))
    setFileSizeLimitInput(String(provider.fileSizeLimitBytes))
    setActiveTab('add')
  }

  const resetProviderForm = () => {
    setEditingProviderId(null)
    setForm(emptyProviderForm)
    setStorageLimitInput(String(emptyProviderForm.storageLimitBytes))
    setFileSizeLimitInput(String(emptyProviderForm.fileSizeLimitBytes))
    setActiveTab('providers')
  }

  const toggleProviderAvailability = async (
    providerId: string,
    isActive: boolean,
  ) => {
    const previousProviders = providers
    setProviders((prev) =>
      prev.map((provider) =>
        provider.id === providerId ? { ...provider, isActive } : provider,
      ),
    )
    try {
      await setStorageProviderAvailabilityFn({ data: { providerId, isActive } })
      toast.success(
        `Provider marked as ${isActive ? `available` : `unavailable`}`,
      )
    } catch (error) {
      setProviders(previousProviders)
      const refreshed = await getAdminProvidersFn()
      setProviders(refreshed)
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update provider availability'
      toast.error(message)
    }
  }

  const deleteProvider = async (providerId: string) => {
    try {
      await deleteStorageProviderFn({ data: { providerId } })
      const [refreshedProviders, refreshedSummary] = await Promise.all([
        getAdminProvidersFn(),
        getAdminSummaryFn(),
      ])
      setProviders(refreshedProviders)
      setSummary(refreshedSummary)
      toast.success('Storage provider deleted')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete provider'
      toast.error(message)
    }
  }

  const handleUserUpdate = async () => {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  }

  return (
    <SidebarInset>
      <header className="flex h-14 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-sm font-semibold">Admin Dashboard</h1>
      </header>
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="add">Add Provider</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-3">
              <Suspense fallback={<PageSkeleton className="h-24 w-full" />}>
                <MetricCard title="Providers" value={summary.providerCount} />
              </Suspense>
              <Suspense fallback={<PageSkeleton className="h-24 w-full" />}>
                <MetricCard title="Users" value={summary.userCount} />
              </Suspense>
              <Suspense fallback={<PageSkeleton className="h-24 w-full" />}>
                <MetricCard
                  title="Total Used"
                  value={formatBytes(summary.totalUsedStorageBytes)}
                />
              </Suspense>
            </div>
          </TabsContent>
          <TabsContent value="providers">
            <Suspense fallback={<PageSkeleton className="h-96 w-full" />}>
              <ProvidersPanel
                providers={providers}
                onToggleAvailability={toggleProviderAvailability}
                onDelete={deleteProvider}
                onEdit={startEditingProvider}
                onViewContents={(provider) => {
                  setSelectedProvider(provider)
                  setIsProviderViewerOpen(true)
                }}
              />
            </Suspense>
          </TabsContent>
          <TabsContent value="users">
            <Suspense fallback={<PageSkeleton className="h-96 w-full" />}>
              <UsersPanel
                users={usersData}
                onUserUpdate={handleUserUpdate}
                onViewUserFiles={(user) => {
                  setSelectedUser(user)
                  setIsUserFilesModalOpen(true)
                }}
              />
            </Suspense>
          </TabsContent>
          <TabsContent value="add">
            <Suspense fallback={<PageSkeleton className="h-96 w-full" />}>
              <ProviderEditorCard
                form={form}
                isEditing={Boolean(editingProviderId)}
                isSaving={isSaving}
                storageLimitInput={storageLimitInput}
                fileSizeLimitInput={fileSizeLimitInput}
                onChange={setProviderField}
                onStorageLimitChange={setStorageLimitInput}
                onFileSizeLimitChange={setFileSizeLimitInput}
                onProxyUploadsEnabledChange={(value) => {
                  setForm((prev) => ({ ...prev, proxyUploadsEnabled: value }))
                }}
                onSubmit={() => {
                  void submitProvider()
                }}
                onCancel={resetProviderForm}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
      <Suspense fallback={null}>
        <ProviderContentsModal
          open={isProviderViewerOpen}
          onOpenChange={(open) => {
            setIsProviderViewerOpen(open)
            if (!open) {
              setSelectedProvider(null)
            }
          }}
          provider={selectedProvider}
        />
      </Suspense>
      <Suspense fallback={null}>
        {selectedUser && (
          <UserFilesModal
            open={isUserFilesModalOpen}
            onOpenChange={(open) => {
              setIsUserFilesModalOpen(open)
              if (!open) {
                setSelectedUser(null)
              }
            }}
            user={selectedUser}
          />
        )}
      </Suspense>
    </SidebarInset>
  )
}
