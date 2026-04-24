import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Key, Trash2, Copy, Loader2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { createChatApiKeyFn, deleteChatApiKeyFn } from '../-settings-server'

type ApiKeySnapshot = {
  id: string
  name: string
  keyPreview: string
  status: string
  scopes: string[]
  createdAt: Date
}

export function ApiKeysSection({
  initialKeys,
}: {
  initialKeys: ApiKeySnapshot[]
}) {
  const queryClient = useQueryClient()
  const [newKeyName, setNewKeyName] = useState('Chat Completions Key')
  const [showKeyDialog, setShowKeyDialog] = useState(false)
  const [revealedKey, setRevealedKey] = useState<string>('')

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      return createChatApiKeyFn({ data: { name } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteChatApiKeyFn({ data: { id } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  const handleCreate = async () => {
    try {
      const result = await createMutation.mutateAsync(newKeyName)
      setRevealedKey(result.apiKey.key)
      setShowKeyDialog(true)
      toast.success('Chat API key generated')
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to create API key'
      toast.error(message)
    }
  }

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value)
    toast.success('Copied to clipboard')
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-background via-background to-muted/30 p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
          <Key className="text-primary size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Chat Completions API Keys</h2>
          <p className="text-muted-foreground text-sm">
            Generate tokens for accessing the chat API
          </p>
        </div>
      </div>

      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API Key Generated</DialogTitle>
            <DialogDescription>
              Save this API key now. It will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex gap-2">
              <Input
                readOnly
                value={revealedKey}
                className="font-mono text-xs"
                aria-label="Generated API key"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => void copyToClipboard(revealedKey)}
                aria-label="Copy API key to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Use header:{' '}
              <code className="bg-muted px-1 py-0.5 rounded">
                Authorization: Bearer &lt;apiKey&gt;
              </code>
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowKeyDialog(false)}>I saved it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-4 flex max-w-md items-center gap-2">
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

      {/* Keys Table */}
      <div className="rounded-xl border overflow-hidden">
        {initialKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="bg-muted/50 flex size-12 items-center justify-center rounded-lg">
              <Key className="text-muted-foreground size-6" />
            </div>
            <div className="text-center">
              <p className="font-medium">No API keys yet</p>
              <p className="text-muted-foreground text-sm">
                Generate a key to access the chat API
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {key.keyPreview}...
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{key.scope}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  )
}
