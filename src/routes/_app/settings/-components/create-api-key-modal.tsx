'use client'

import { useRef, useState } from 'react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Activity } from '@/components/ui/activity'
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TagInput } from '@/components/ui/tag-input'
import { toast } from 'sonner'
import type { ApiScope } from '@/lib/permissions/scopes'
import { getScopeDisplayName } from '@/lib/permissions/scopes'
import { createChatApiKeyFn } from './-settings-server'

type CreateApiKeyModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateApiKeyModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateApiKeyModalProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [keyName, setKeyName] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>([])
  const [errors, setErrors] = useState<{ name?: string; scopes?: string }>({})
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async ({
      name,
      scopes,
    }: {
      name: string
      scopes: ApiScope[]
    }) => {
      return createChatApiKeyFn({ data: { name, scopes } })
    },
    onSuccess: (result) => {
      setGeneratedKey(result.apiKey.key)
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      onSuccess?.()
      toast.success('API key created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create API key')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { name?: string; scopes?: string } = {}

    if (!keyName.trim()) {
      newErrors.name = 'Key name is required'
    }

    if (selectedScopes.length === 0) {
      newErrors.scopes = 'At least one scope must be selected'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    createMutation.mutate({
      name: keyName.trim(),
      scopes: selectedScopes as ApiScope[],
    })
  }

  const handleScopesChange = (scopes: string[]) => {
    setSelectedScopes(scopes)
    if (scopes.length === 0) {
      setErrors((prev) => ({
        ...prev,
        scopes: 'At least one scope must be selected',
      }))
    } else {
      setErrors((prev) => ({ ...prev, scopes: undefined }))
    }
  }

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value)
    toast.success('Copied to clipboard')
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setKeyName('')
      setSelectedScopes([])
      setErrors({})
      setGeneratedKey(null)
    }
    onOpenChange(newOpen)
  }

  const canSubmit =
    !generatedKey &&
    !createMutation.isPending &&
    keyName.trim().length > 0 &&
    selectedScopes.length > 0

  useHotkey(
    'Mod+Enter',
    () => {
      formRef.current?.requestSubmit()
    },
    { enabled: open && canSubmit },
  )

  useHotkey(
    'Escape',
    () => {
      handleOpenChange(false)
    },
    { enabled: open },
  )

  useHotkey(
    'Mod+C',
    () => {
      if (generatedKey) {
        void copyToClipboard(generatedKey)
      }
    },
    { enabled: open && Boolean(generatedKey) },
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {generatedKey ? 'API Key Created' : 'Create New API Key'}
          </DialogTitle>
          <DialogDescription>
            {generatedKey
              ? 'Save this API key now. It will not be shown again.'
              : 'Generate a new API key with specific permissions. Choose at least one scope.'}
          </DialogDescription>
        </DialogHeader>

        <Activity
          when={Boolean(generatedKey)}
          fallback={
            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                {/* Key Name */}
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="My First API Key"
                    value={keyName}
                    onChange={(e) => {
                      setKeyName(e.target.value)
                      if (e.target.value.trim()) {
                        setErrors((prev) => ({ ...prev, name: undefined }))
                      }
                    }}
                    className={errors.name ? 'border-destructive' : ''}
                    disabled={createMutation.isPending}
                  />
                  {errors.name && (
                    <p className="text-destructive text-xs">{errors.name}</p>
                  )}
                </div>

                {/* Scopes Selection */}
                <div className="space-y-2">
                  <Label>Scopes (Permissions)</Label>
                  <TagInput
                    value={selectedScopes}
                    onChange={handleScopesChange}
                    placeholder="Select scopes..."
                    disabled={createMutation.isPending}
                    className={errors.scopes ? 'border-destructive' : ''}
                  />
                  <p className="text-muted-foreground text-xs">
                    Start typing to see available scopes. Click on a scope to
                    add it as a tag.
                  </p>
                  {errors.scopes && (
                    <p className="text-destructive text-xs">{errors.scopes}</p>
                  )}

                  {/* Quick selection helpers */}
                  <div className="flex flex-wrap gap-1 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedScopes(['chat:completions'])}
                      disabled={createMutation.isPending}
                    >
                      Chat Only
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedScopes(['files:full', 'folders:full'])
                      }
                      disabled={createMutation.isPending}
                    >
                      Files & Folders
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedScopes(['s3:full'])}
                      disabled={createMutation.isPending}
                    >
                      Full S3
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedScopes(['admin:system'])}
                      disabled={createMutation.isPending}
                    >
                      Admin
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedScopes([])}
                      disabled={createMutation.isPending}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                {/* Selected Scopes Preview */}
                <Activity when={selectedScopes.length > 0}>
                  <div className="space-y-2">
                    <Label>Selected Scopes:</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedScopes.map((scope) => (
                        <div
                          key={scope}
                          className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs font-medium"
                        >
                          {getScopeDisplayName(scope as ApiScope)}
                          <span className="ml-1 opacity-70">({scope})</span>
                          <DialogFooter>
                            <Button onClick={() => onOpenChange(false)}>
                              Done
                            </Button>
                          </DialogFooter>
                        </div>
                      ))}
                    </div>
                  </div>
                </Activity>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={createMutation.isPending}
                >
                  Cancel <KeyboardShortcut keys="Escape" className="ml-2" />
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    !keyName.trim() ||
                    selectedScopes.length === 0
                  }
                >
                  <Activity
                    when={createMutation.isPending}
                    fallback={
                      <>
                        Create API Key{' '}
                        <KeyboardShortcut keys="Mod+Enter" className="ml-2" />
                      </>
                    }
                  >
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  </Activity>
                </Button>
              </DialogFooter>
            </form>
          }
        >
          <div className="flex flex-col gap-4 py-4">
            <div className="flex gap-2">
              <Input
                readOnly
                value={generatedKey}
                className="font-mono text-xs"
                aria-label="Generated API key"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => void copyToClipboard(generatedKey)}
                aria-label="Copy API key to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <KeyboardShortcut keys="Mod+C" className="self-center" />
            </div>
            <p className="text-muted-foreground text-xs">
              Use header:{' '}
              <code className="bg-muted px-1 py-0.5 rounded">
                Authorization: Bearer &lt;apiKey&gt;
              </code>
            </p>
          </div>
        </Activity>
      </DialogContent>
    </Dialog>
  )
}
