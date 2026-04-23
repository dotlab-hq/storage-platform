import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Key, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createS3ApiKeyFn, deleteS3ApiKeyFn } from '../-settings-server'
import { toast } from 'sonner'

type ApiKeySnapshot = {
  id: string
  accessKeyId: string
  secretKeyLast4: string
  status: string
  createdAt: Date
}

export function ApiKeysSection({
  initialKeys,
}: {
  initialKeys: ApiKeySnapshot[]
}) {
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [revealedKey, setRevealedKey] = useState<{
    accessId: string
    secretKey: string
  } | null>(null)

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await createS3ApiKeyFn({ data: { name } })
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteS3ApiKeyFn({ data: { id } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      const result = await createMutation.mutateAsync(newKeyName)
      setRevealedKey({
        accessId: result.apiKey.accessKeyId,
        secretKey: result.apiKey.secretKey,
      })
      setNewKeyName('')
      toast.success('API Key created successfully')
    } catch (e: any) {
      toast.error(e.message || 'Failed to create API key')
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <section className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">S3 API Keys</h2>
          <p className="text-muted-foreground text-sm">
            Manage your access keys for S3 storage
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setRevealedKey(null)
            // Focus input if needed
          }}
          variant="outline"
        >
          <Key className="mr-2 h-4 w-4" /> Manage Keys
        </Button>
      </div>

      {revealedKey && (
        <Alert className="bg-amber-50 border-amber-200">
          <div className="flex flex-col gap-3">
            <AlertDescription className="font-medium text-amber-800">
              ⚠️ Save this secret key now. You won't be able to see it again!
            </AlertDescription>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-700">
                  Access Key ID
                </label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={revealedKey.accessId}
                    className="bg-white"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(revealedKey.accessId)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-700">
                  Secret Access Key
                </label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={revealedKey.secretKey}
                    className="bg-white"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(revealedKey.secretKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="w-fit"
              onClick={() => setRevealedKey(null)}
            >
              I have saved it
            </Button>
          </div>
        </Alert>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Key name (e.g. Production App)"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          disabled={isCreating}
        />
        <Button onClick={handleCreate} disabled={!newKeyName || isCreating}>
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Key className="h-4 w-4 mr-2" />
          )}
          Create
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 font-medium">
            <tr>
              <th className="px-4 py-2">Access Key ID</th>
              <th className="px-4 py-2">Secret (Last 4)</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {initialKeys.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No API keys found. Create one above.
                </td>
              </tr>
            ) : (
              initialKeys.map((key) => (
                <tr key={key.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2 font-mono text-xs">
                    {key.accessKeyId}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">
                    ....{key.secretKeyLast4}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm('Delete this API key?')) {
                          deleteMutation.mutate(key.id)
                        }
                      }}
                      disabled={deleteMutation.isPending}
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
