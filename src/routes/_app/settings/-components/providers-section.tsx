import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Edit, Eye, Plus, Server, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ProviderContentsModal } from '@/components/admin/provider-contents-modal'
import { formatBytes } from '@/lib/format-bytes'
import type { UserProvider } from '@/lib/storage-provider-queries'
import { settingsQuery, userProvidersQuery } from './settings-query'
import { useUserProviderMutations } from './use-user-provider-mutations'
import type { SaveProviderInput } from './use-user-provider-mutations'
import { ProviderFormDialog } from './provider-form-dialog'

/** Which provider the add/edit dialog is open for (null = new provider). */
type EditorState = { provider: UserProvider | null }

/**
 * Lets the user choose between the platform's managed storage and their own
 * S3-compatible providers, and manage the latter.
 */
export function ProvidersSection() {
  const { data: settings } = useSuspenseQuery(settingsQuery())
  const { data: providers } = useSuspenseQuery(userProvidersQuery())
  const useSystem = settings.use_system_providers
  const customProviders = providers.filter((provider) =>
    Boolean(provider.userId),
  )

  const mutations = useUserProviderMutations()
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [viewerProvider, setViewerProvider] = useState<UserProvider | null>(
    null,
  )

  const setUseSystem = (value: boolean) =>
    mutations.setUseSystemProviders.mutate(value)
  const openAddDialog = () => setEditor({ provider: null })
  const saveProvider = (input: SaveProviderInput) =>
    mutations.save.mutate(input, { onSuccess: () => setEditor(null) })
  const deleteProvider = (provider: UserProvider) => {
    if (confirm(`Delete the provider "${provider.name}"?`)) {
      mutations.remove.mutate(provider.id)
    }
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
              onCheckedChange={setUseSystem}
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
                onClick={() => setUseSystem(false)}
              >
                Switch to Custom Providers
              </Button>
            </div>
          </div>
        </div>
      ) : customProviders.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            You haven't added any storage providers yet.
          </p>
          <Button onClick={openAddDialog} variant="outline" className="mt-4">
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
                    onCheckedChange={(isActive) =>
                      mutations.toggleActive.mutate({
                        providerId: provider.id,
                        isActive,
                      })
                    }
                    aria-label={`Toggle ${provider.name} active`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Browse ${provider.name}`}
                    onClick={() => setViewerProvider(provider)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${provider.name}`}
                    onClick={() => setEditor({ provider })}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${provider.name}`}
                    disabled={provider.usedStorageBytes > 0}
                    onClick={() => deleteProvider(provider)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editor && (
        <ProviderFormDialog
          provider={editor.provider}
          isSaving={mutations.save.isPending}
          onSave={saveProvider}
          onClose={() => setEditor(null)}
        />
      )}
      {viewerProvider && (
        <ProviderContentsModal
          open
          onOpenChange={(open) => {
            if (!open) setViewerProvider(null)
          }}
          provider={viewerProvider}
          scope="user"
        />
      )}
    </div>
  )
}
