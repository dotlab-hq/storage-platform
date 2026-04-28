'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ProviderEditorCard } from '@/components/admin/provider-editor-card'
import { ProviderContentsModal } from '@/components/admin/provider-contents-modal'
import { formatBytes } from '@/lib/format-bytes'
import { Server, Plus, Edit, Trash2, Eye } from 'lucide-react'
import type {
  AdminProvider,
  UserProvider,
} from '@/lib/storage-provider-queries'
import {
  getUserProvidersFn,
  saveUserProviderFn,
  deleteUserProviderFn,
  toggleUserProviderActiveFn,
  updateProviderPreferenceFn,
} from './-providers-server'

type Props = {
  initialProviders: UserProvider[]
  initialUseSystemProviders: boolean
}

type ProviderFormState = {
  name: string
  endpoint: string
  region: string
  bucketName: string
  accessKeyId: string
  secretAccessKey: string
  storageLimitBytes: number
  fileSizeLimitBytes: number
  proxyUploadsEnabled: boolean
  isActive: boolean
}

function toAdminProvider(provider: UserProvider): AdminProvider {
  return {
    ...provider,
  }
}

export function ProvidersSection({
  initialProviders,
  initialUseSystemProviders,
}: Props) {
  const queryClient = useQueryClient()
  const [useSystem, setUseSystem] = useState(initialUseSystemProviders)

  const { data: providers = initialProviders } = useQuery<UserProvider[]>({
    queryKey: ['user-providers'],
    queryFn: getUserProvidersFn,
    initialData: initialProviders,
  })

  const customProviders = providers.filter((provider) =>
    Boolean(provider.userId),
  )

  // Preference mutation
  const prefMutation = useMutation({
    mutationFn: (val: boolean) =>
      updateProviderPreferenceFn({ data: { use_system_providers: val } }),
    onMutate: async (newVal) => {
      setUseSystem(newVal)
    },
    onError: () => {
      toast.error('Failed to update provider preference')
      // revert to initial or current? simple fallback
      setUseSystem(initialUseSystemProviders)
    },
  })

  const handleTogglePreference = (checked: boolean) => {
    prefMutation.mutate(checked)
  }

  // Provider CRUD mutations with optimistic updates
  const saveMutation = useMutation({
    mutationFn: (data: {
      providerId?: string
      name: string
      endpoint: string
      region: string
      bucketName: string
      accessKeyId: string
      secretAccessKey: string
      storageLimitBytes: number
      fileSizeLimitBytes: number
      proxyUploadsEnabled: boolean
      isActive: boolean
    }) => saveUserProviderFn({ data }),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['user-providers'] })
      const previous = queryClient.getQueryData<UserProvider[]>([
        'user-providers',
      ])
      if (newData.providerId) {
        // update
        queryClient.setQueryData<UserProvider[]>(['user-providers'], (old) =>
          (old ?? []).map((p) =>
            p.id === newData.providerId
              ? {
                  ...p,
                  name: newData.name,
                  endpoint: newData.endpoint,
                  region: newData.region,
                  bucketName: newData.bucketName,
                  storageLimitBytes: newData.storageLimitBytes,
                  fileSizeLimitBytes: newData.fileSizeLimitBytes,
                  proxyUploadsEnabled: newData.proxyUploadsEnabled,
                  isActive: newData.isActive,
                }
              : p,
          ),
        )
      } else {
        // create
        const optimistic: UserProvider = {
          id: `temp-${Date.now()}`,
          userId: 'optimistic-user',
          name: newData.name,
          region: newData.region,
          endpoint: newData.endpoint,
          bucketName: newData.bucketName,
          storageLimitBytes: newData.storageLimitBytes,
          fileSizeLimitBytes: newData.fileSizeLimitBytes,
          proxyUploadsEnabled: newData.proxyUploadsEnabled,
          isActive: newData.isActive,
          createdAt: new Date(),
          usedStorageBytes: 0,
          availableStorageBytes: newData.storageLimitBytes,
        }
        queryClient.setQueryData<UserProvider[]>(['user-providers'], (old) => [
          ...(old ?? []),
          optimistic,
        ])
      }
      return { previous }
    },
    onError: (err, _newData, context) => {
      queryClient.setQueryData(['user-providers'], context?.previous)
      toast.error(
        err instanceof Error ? err.message : 'Failed to save provider',
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-providers'] })
      toast.success('Provider saved')
      setIsDialogOpen(false)
      setEditingProvider(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (providerId: string) =>
      deleteUserProviderFn({ data: { providerId } }),
    onMutate: async (providerId) => {
      await queryClient.cancelQueries({ queryKey: ['user-providers'] })
      const previous = queryClient.getQueryData<UserProvider[]>([
        'user-providers',
      ])
      queryClient.setQueryData<UserProvider[]>(['user-providers'], (old) =>
        (old ?? []).filter((p) => p.id !== providerId),
      )
      return { previous }
    },
    onError: (_err, _providerId, context) => {
      queryClient.setQueryData(['user-providers'], context?.previous)
      toast.error('Failed to delete provider')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-providers'] })
      toast.success('Provider deleted')
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({
      providerId,
      isActive,
    }: {
      providerId: string
      isActive: boolean
    }) => toggleUserProviderActiveFn({ data: { providerId, isActive } }),
    onMutate: async ({ providerId, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ['user-providers'] })
      const previous = queryClient.getQueryData<UserProvider[]>([
        'user-providers',
      ])
      queryClient.setQueryData<UserProvider[]>(['user-providers'], (old) =>
        (old ?? []).map((p) => (p.id === providerId ? { ...p, isActive } : p)),
      )
      return { previous }
    },
    onError: () => {
      toast.error('Failed to update provider status')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-providers'] })
    },
  })

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<UserProvider | null>(
    null,
  )
  const [form, setForm] = useState<ProviderFormState>({
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
  })
  const [viewerProvider, setViewerProvider] = useState<UserProvider | null>(
    null,
  )
  const [storageLimitInput, setStorageLimitInput] = useState(
    String(10 * 1024 * 1024 * 1024),
  )
  const [fileSizeLimitInput, setFileSizeLimitInput] = useState(
    String(100 * 1024 * 1024),
  )

  const openAddDialog = () => {
    setEditingProvider(null)
    setForm({
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
    })
    setStorageLimitInput(String(10 * 1024 * 1024 * 1024))
    setFileSizeLimitInput(String(100 * 1024 * 1024))
    setIsDialogOpen(true)
  }

  const openEditDialog = (provider: UserProvider) => {
    setEditingProvider(provider)
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
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    const parsedStorage = Number(storageLimitInput)
    const parsedFileSize = Number(fileSizeLimitInput)
    if (!Number.isFinite(parsedStorage) || parsedStorage <= 0) {
      toast.error('Storage limit must be a positive number')
      return
    }
    if (!Number.isFinite(parsedFileSize) || parsedFileSize <= 0) {
      toast.error('File-size limit must be a positive number')
      return
    }
    if (parsedFileSize > parsedStorage) {
      toast.error('File-size limit cannot exceed storage limit')
      return
    }
    // On create, require credentials
    if (!editingProvider) {
      if (
        !form.accessKeyId.trim() ||
        !form.secretAccessKey.trim() ||
        !form.endpoint.trim() ||
        !form.region.trim() ||
        !form.bucketName.trim()
      ) {
        toast.error('All credential fields are required')
        return
      }
    }

    const payload = {
      providerId: editingProvider?.id,
      name: form.name.trim(),
      endpoint: form.endpoint.trim(),
      region: form.region.trim(),
      bucketName: form.bucketName.trim(),
      accessKeyId: form.accessKeyId.trim(),
      secretAccessKey: form.secretAccessKey.trim(),
      storageLimitBytes: parsedStorage,
      fileSizeLimitBytes: parsedFileSize,
      proxyUploadsEnabled: form.proxyUploadsEnabled,
      isActive: form.isActive,
    }

    saveMutation.mutate(payload)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Storage Providers</h2>
          <p className="text-muted-foreground text-sm">
            {useSystem
              ? "Using the platform's managed storage providers."
              : 'Use your own S3-compatible storage providers.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="provider-mode-toggle" className="text-sm">
              {useSystem ? 'System' : 'Custom'}
            </Label>
            <Switch
              id="provider-mode-toggle"
              checked={useSystem}
              onCheckedChange={handleTogglePreference}
            />
          </div>
          {!useSystem && (
            <Button onClick={openAddDialog} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          )}
        </div>
      </div>

      {useSystem ? (
        <div className="rounded-lg border border-border/50 bg-muted/30 p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-lg">
              <Server className="text-primary size-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Managed Storage</h3>
              <p className="text-muted-foreground text-sm">
                Your files are stored on our secure, managed S3-compatible
                infrastructure. No configuration needed.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => handleTogglePreference(false)}
              >
                Switch to Custom Providers
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {customProviders.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                You haven't added any storage providers yet.
              </p>
              <Button
                onClick={openAddDialog}
                variant="outline"
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add your first provider
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {customProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="group relative overflow-hidden rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-border/80"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{provider.name}</p>
                        <Badge
                          variant={provider.isActive ? 'default' : 'secondary'}
                        >
                          {provider.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Storage: {formatBytes(provider.usedStorageBytes)} /{' '}
                        {formatBytes(provider.storageLimitBytes)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={provider.isActive}
                        onCheckedChange={(checked) => {
                          toggleActiveMutation.mutate({
                            providerId: provider.id,
                            isActive: checked,
                          })
                        }}
                        aria-label={`Toggle ${provider.name} active`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewerProvider(provider)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(provider)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={provider.usedStorageBytes > 0}
                        onClick={() => {
                          if (
                            confirm(
                              'Are you sure you want to delete this provider?',
                            )
                          ) {
                            deleteMutation.mutate(provider.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Provider Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingProvider(null)
          }
        }}
      >
        <DialogContent className="w-[min(96vw,1100px)] max-w-[1100px]">
          <DialogHeader>
            <DialogTitle>
              {editingProvider
                ? 'Edit Storage Provider'
                : 'Add Storage Provider'}
            </DialogTitle>
            <DialogDescription>
              {editingProvider
                ? 'Update your S3-compatible storage provider credentials.'
                : 'Enter your S3-compatible storage provider details. Credentials are encrypted at rest.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ProviderEditorCard
              form={form}
              isEditing={Boolean(editingProvider)}
              isSaving={saveMutation.isPending}
              storageLimitInput={storageLimitInput}
              fileSizeLimitInput={fileSizeLimitInput}
              onChange={(field, value) =>
                setForm((prev) => ({ ...prev, [field]: value }))
              }
              onStorageLimitChange={setStorageLimitInput}
              onFileSizeLimitChange={setFileSizeLimitInput}
              onProxyUploadsEnabledChange={(value) =>
                setForm((prev) => ({ ...prev, proxyUploadsEnabled: value }))
              }
              onSubmit={handleSave}
              onCancel={() => setIsDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
      <ProviderContentsModal
        open={viewerProvider !== null}
        onOpenChange={(open) => {
          if (!open) {
            setViewerProvider(null)
          }
        }}
        provider={viewerProvider ? toAdminProvider(viewerProvider) : null}
        scope="user"
      />
    </div>
  )
}
