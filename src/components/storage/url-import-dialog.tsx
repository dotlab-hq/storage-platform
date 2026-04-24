'use client'

import * as React from 'react'
import { Link, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUrlImport, type PendingImport } from '@/hooks/use-url-import'

type UrlImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
  currentFolderId: string | null
  setItems?: React.Dispatch<
    React.SetStateAction<import('@/types/storage').StorageItem[]>
  >
  onImportComplete?: () => Promise<void> | void
}

export function UrlImportDialog({
  open,
  onOpenChange,
  userId,
  currentFolderId,
  setItems,
  onImportComplete,
}: UrlImportDialogProps) {
  const {
    url,
    setUrl,
    fileName,
    setFileName,
    importState,
    error,
    pendingImport,
    validateUrl,
    executeImport,
    reset,
  } = useUrlImport({ userId, currentFolderId, onImportComplete, setItems })

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && importState === 'idle') {
      e.preventDefault()
      executeImport()
    }
  }

  const handleMainAction = async () => {
    if (pendingImport) {
      const success = await executeImport()
      if (success) {
        onOpenChange(false)
        toast.success(`Imported "${pendingImport.fileName}"`)
      }
    } else {
      await validateUrl()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import from URL</DialogTitle>
          <DialogDescription>
            Enter a URL to import a file directly from the internet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">File URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/file.pdf"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setPendingImport(null)
                setError(null)
              }}
              onKeyDown={handleKeyDown}
              disabled={
                importState === 'validating' || importState === 'importing'
              }
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileName">File Name (optional)</Label>
            <Input
              id="fileName"
              type="text"
              placeholder="Leave blank to use URL filename"
              value={fileName}
              onChange={(e) => {
                setFileName(e.target.value)
                setPendingImport(null)
              }}
              disabled={
                importState === 'validating' || importState === 'importing'
              }
            />
          </div>

          {pendingImport && <UrlPreviewCard pendingImport={pendingImport} />}
        </div>

        <DialogFooter>
          {error && <p className="text-destructive mr-auto text-sm">{error}</p>}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={importState === 'importing'}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMainAction}
            disabled={
              importState === 'validating' ||
              importState === 'importing' ||
              !url.trim()
            }
          >
            {importState === 'validating' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : importState === 'importing' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : pendingImport ? (
              'Import'
            ) : (
              'Validate'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function UrlPreviewCard({ pendingImport }: { pendingImport: PendingImport }) {
  return (
    <div className="rounded-md border bg-muted/50 p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <Link className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">
            {pendingImport.fileName}
          </p>
          <p className="text-muted-foreground text-xs">
            {pendingImport.size}
            {pendingImport.mimeType && ` • ${pendingImport.mimeType}`}
          </p>
        </div>
      </div>
    </div>
  )
}
