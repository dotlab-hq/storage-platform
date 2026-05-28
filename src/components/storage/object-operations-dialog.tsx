import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ObjectPayload } from '@/components/storage/object-operations-types'
import { ObjectOperationsPropertiesTab } from '@/components/storage/object-operations-properties-tab'
import { ObjectOperationsTagsTab } from '@/components/storage/object-operations-tags-tab'
import { ObjectOperationsVersionsTab } from '@/components/storage/object-operations-versions-tab'
import { ObjectOperationsPermissionsTab } from '@/components/storage/object-operations-permissions-tab'

type ObjectOperationsDialogProps = {
  bucketName: string | null
  onOpenChange: (open: boolean) => void
}
type ObjectTab = 'properties' | 'tags' | 'versions' | 'permissions'
export function ObjectOperationsDialog({
  bucketName,
  onOpenChange,
}: ObjectOperationsDialogProps) {
  const [objectKey, setObjectKey] = useState('')
  const [activeTab, setActiveTab] = useState<ObjectTab>('properties')
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['object-settings', bucketName, objectKey],
    enabled: bucketName !== null && objectKey.trim().length > 0,
    queryFn: async () => {
      const qs = new URLSearchParams({
        bucketName: bucketName ?? '',
        objectKey,
      }).toString()
      const response = await fetch(`/api/storage/s3/object-settings?${qs}`)
      if (!response.ok) throw new Error('Failed to load object')
      const payload: ObjectPayload = await response.json()
      return payload
    },
  })
  const update = useMutation({
    mutationFn: async (payload: unknown) => {
      const response = await fetch('/api/storage/s3/object-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Update failed')
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: ['object-settings', bucketName, objectKey],
      })
      const previous = queryClient.getQueryData<ObjectPayload>([
        'object-settings',
        bucketName,
        objectKey,
      ])
      if (
        !previous ||
        typeof payload !== 'object' ||
        payload === null ||
        !('action' in payload)
      ) {
        return { previous }
      }

      const actionPayload = payload as { action: string }
      if (actionPayload.action === 'tags' && 'tags' in actionPayload) {
        queryClient.setQueryData<ObjectPayload>(
          ['object-settings', bucketName, objectKey],
          { ...previous, tags: actionPayload.tags as ObjectPayload['tags'] },
        )
      }
      if (actionPayload.action === 'acl' && 'cannedAcl' in actionPayload) {
        queryClient.setQueryData<ObjectPayload>(
          ['object-settings', bucketName, objectKey],
          { ...previous, acl: actionPayload.cannedAcl as ObjectPayload['acl'] },
        )
      }
      return { previous }
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ['object-settings', bucketName, objectKey],
          context.previous,
        )
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['object-settings', bucketName, objectKey],
      })
    },
  })
  return (
    <Dialog open={bucketName !== null} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(94vw,56rem)] max-h-[85vh] overflow-y-auto border border-border/60 bg-card shadow-sm">
        <DialogHeader className="text-left">
          <DialogTitle>Object Operations</DialogTitle>
          <DialogDescription>
            {bucketName ? `Manage object in ${bucketName}` : ''}
          </DialogDescription>
        </DialogHeader>
        <Input
          value={objectKey}
          onChange={(e) => setObjectKey(e.target.value)}
          placeholder="path/to/object.txt"
          className="bg-muted/30"
        />
        <div className="flex flex-wrap gap-2">
          {(['properties', 'tags', 'versions', 'permissions'] as ObjectTab[]).map(
            (tab) => (
              <Button
                key={tab}
                size="sm"
                variant={activeTab === tab ? 'default' : 'outline'}
                className={
                  activeTab === tab
                    ? 'bg-foreground text-background'
                    : 'border-border/60 bg-muted/30 text-foreground'
                }
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button>
            ),
          )}
        </div>
        {query.error && (
          <div className="rounded border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-200">
            {query.error.message}
          </div>
        )}
        {update.error && (
          <div className="rounded border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-200">
            {update.error.message}
          </div>
        )}
        {query.data && activeTab === 'properties' && (
          <ObjectOperationsPropertiesTab
            payload={query.data}
            objectKey={objectKey}
          />
        )}
        {query.data && activeTab === 'tags' && (
          <ObjectOperationsTagsTab
            payload={query.data}
            onSave={(tags) =>
              update.mutate({ action: 'tags', bucketName, objectKey, tags })
            }
            isPending={update.isPending}
          />
        )}
        {query.data && activeTab === 'versions' && (
          <ObjectOperationsVersionsTab
            payload={query.data}
            onRestore={(versionId) =>
              update.mutate({
                action: 'restore',
                bucketName,
                objectKey,
                versionId,
              })
            }
            isPending={update.isPending}
          />
        )}
        {query.data && activeTab === 'permissions' && (
          <ObjectOperationsPermissionsTab
            payload={query.data}
            onToggle={(nextAcl) =>
              update.mutate({ action: 'acl', bucketName, objectKey, cannedAcl: nextAcl })
            }
            isPending={update.isPending}
          />
        )}
        <DialogFooter className="flex w-full flex-row justify-between">
          <DialogClose asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-border/60 bg-muted/30 text-foreground"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

