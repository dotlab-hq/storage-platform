import { createFileRoute, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  deleteStorageProviderFn,
  getAdminDashboardDataFn,
  saveStorageProviderFn,
  setStorageProviderAvailabilityFn,
} from './-admin-server'
import {
  MetricCard,
  ProvidersPanel,
  UsersPanel,
} from '@/components/admin/dashboard-panels'
import { formatBytes } from '@/lib/format-bytes'
import type {
  AdminProvider,
  AdminSummary,
  AdminUser,
} from '@/lib/storage-provider-queries'
import { ProviderEditorCard } from '@/components/admin/provider-editor-card'
import { ProviderContentsModal } from '@/components/admin/provider-contents-modal'
import { isAdminMiddleware } from '@/middlewares/isAdmin'

type AdminDashboardData = {
  summary: AdminSummary
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
}

function isNotFoundPayload(value: unknown): value is { isNotFound: true } {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as { isNotFound?: unknown }
  return candidate.isNotFound === true
}

export const Route = createFileRoute('/_app/admin/')({
  server: {
    middleware: [isAdminMiddleware],
  },
  component: AdminDashboardPage,
  loader: async () => {
    const data = await getAdminDashboardDataFn()
    if (isNotFoundPayload(data)) {
      throw notFound()
    }

    return data
  },
})

function AdminDashboardPage() {
  const initial = Route.useLoaderData() as AdminDashboardData | undefined
  const [data, setData] = useState<AdminDashboardData>(
    initial ?? emptyDashboardData,
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
  const [activeTab, setActiveTab] = useState('overview')
  type ProviderTextField =
    | 'name'
    | 'endpoint'
    | 'region'
    | 'bucketName'
    | 'accessKeyId'
    | 'secretAccessKey'
  const setProviderField = (field: ProviderTextField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }
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
    const optimisticProviderCount = editingProviderId
      ? data.summary.providerCount
      : data.summary.providerCount + 1
    setIsSaving(true)
    setData((prev) => ({
      ...prev,
      summary: {
        ...prev.summary,
        providerCount: optimisticProviderCount,
      },
      providers: editingProviderId
        ? prev.providers.map((provider) =>
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
                  availableStorageBytes:
                    parsedLimit - provider.usedStorageBytes,
                }
              : provider,
          )
        : [
            ...prev.providers,
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
          ],
    }))
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
      const refreshed = await getAdminDashboardDataFn()
      if (refreshed) {
        setData(refreshed)
      } else {
        toast.error('Failed to refresh dashboard data after save')
      }
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
      const latest = await getAdminDashboardDataFn()
      if (latest) {
        setData(latest)
      } else {
        toast.error('Failed to refresh dashboard data')
      }
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
    setData((prev) => ({
      ...prev,
      providers: prev.providers.map((provider) =>
        provider.id === providerId ? { ...provider, isActive } : provider,
      ),
    }))
    try {
      await setStorageProviderAvailabilityFn({ data: { providerId, isActive } })
      toast.success(
        `Provider marked as ${isActive ? `available` : `unavailable`}`,
      )
    } catch (error) {
      const refreshed = await getAdminDashboardDataFn()
      if (refreshed) {
        setData(refreshed)
      }
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
      const refreshed = await getAdminDashboardDataFn()
      if (refreshed) {
        setData(refreshed)
      } else {
        toast.error('Failed to refresh dashboard data after delete')
      }
      toast.success('Storage provider deleted')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete provider'
      toast.error(message)
    }
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
              <MetricCard
                title="Providers"
                value={data.summary.providerCount}
              />
              <MetricCard title="Users" value={data.summary.userCount} />
              <MetricCard
                title="Total Used"
                value={formatBytes(data.summary.totalUsedStorageBytes)}
              />
            </div>
          </TabsContent>
          <TabsContent value="providers">
            <ProvidersPanel
              providers={data.providers}
              onToggleAvailability={toggleProviderAvailability}
              onDelete={deleteProvider}
              onEdit={startEditingProvider}
              onViewContents={(provider) => {
                setSelectedProvider(provider)
                setIsProviderViewerOpen(true)
              }}
            />
          </TabsContent>
          <TabsContent value="users">
            <UsersPanel
              users={data.users}
              onUserUpdate={async () => {
                const refreshed = await getAdminDashboardDataFn()
                setData(refreshed)
              }}
            />
          </TabsContent>
          <TabsContent value="add">
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
          </TabsContent>
        </Tabs>
      </div>
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
    </SidebarInset>
  )
}
