import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Copy, KeyRound, Loader2, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

type ApiKeySnapshot = {
  id: string
  name: string
  keyPreview: string
  status: string
  scope: string
  createdAt: Date
}

type RevealedKey = {
  value: string
}

export function ApiKeysSection({
  initialKeys,
}: {
  initialKeys: ApiKeySnapshot[]
}) {
  const queryClient = useQueryClient()
  const [newKeyName, setNewKeyName] = useState('Chat Completions Key')
  const [revealedKey, setRevealedKey] = useState<RevealedKey | null>(null)

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const mod = await import('../-settings-server')
      return mod.createChatApiKeyFn({ data: { name } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const mod = await import('../-settings-server')
      await mod.deleteChatApiKeyFn({ data: { id } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  const handleCreate = async () => {
    try {
      const result = await createMutation.mutateAsync(newKeyName)
      setRevealedKey({ value: result.apiKey.key })
      toast.success('Chat API key generated')
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to create API key'
      toast.error(message)
    }
  }

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value)
    toast.success('Copied')
  }

  return (
    <section className="space-y-4 rounded-lg border p-4">
      <div>
        <h2 className="text-base font-semibold">Chat Completions API Keys</h2>
        <p className="text-muted-foreground text-sm">
          Generate a single `apiKey` token for `POST /api/chat/stream`.
        </p>
      </div>

      {revealedKey ? (
        <Alert className="border-amber-200 bg-amber-50">
          <div className="space-y-3">
            <AlertDescription className="font-medium text-amber-800">
              Save this API key now. It will not be shown again.
            </AlertDescription>
            <div className="flex gap-2">
              <Input
                readOnly
                value={revealedKey.value}
                className="bg-white font-mono text-xs"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => void copyToClipboard(revealedKey.value)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Use header: Authorization: Bearer &lt;apiKey&gt;
            </p>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setRevealedKey(null)}
            >
              I saved it
            </Button>
          </div>
        </Alert>
      ) : null}

      <div className="flex gap-2">
        <Input
          placeholder="Key name"
          value={newKeyName}
          onChange={(event) => setNewKeyName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && newKeyName.trim()) {
              void handleCreate()
            }
          }}
          disabled={createMutation.isPending}
        />
        <Button
          onClick={() => void handleCreate()}
          disabled={!newKeyName.trim() || createMutation.isPending}
        >
          {createMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="mr-2 h-4 w-4" />
          )}
          Generate
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 font-medium">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Preview</th>
              <th className="px-4 py-2">Scope</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {initialKeys.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-muted-foreground px-4 py-8 text-center"
                >
                  No chat API keys yet.
                </td>
              </tr>
            ) : (
              initialKeys.map((key) => (
                <tr key={key.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2">{key.name}</td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {key.keyPreview}...
                  </td>
                  <td className="px-4 py-2">{key.scope}</td>
                  <td className="text-muted-foreground px-4 py-2">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-8 w-8"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (confirm('Delete this API key?')) {
                          deleteMutation.mutate(key.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
