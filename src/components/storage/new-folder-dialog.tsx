import * as React from 'react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { Button } from '@/components/ui/button'
import { Activity } from '@/components/ui/activity'
import { Input } from '@/components/ui/input'
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type NewFolderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (folderName: string) => Promise<void> | void
}

export function NewFolderDialog({
  open,
  onOpenChange,
  onConfirm,
}: NewFolderDialogProps) {
  const formRef = React.useRef<HTMLFormElement>(null)
  const [folderName, setFolderName] = React.useState('New Folder')
  const [optimisticFolderName, setOptimisticFolderName] =
    React.useOptimistic(folderName)
  const [isCreating, setIsCreating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useLayoutEffect(() => {
    if (open) {
      setFolderName('New Folder')
      setError(null)
      setIsCreating(false)
      inputRef.current?.select()
    }
  }, [open])

  const submitFolder = React.useEffectEvent(async () => {
    const trimmed = folderName.trim()
    if (!trimmed) {
      setError('Folder name cannot be empty.')
      return
    }

    setError(null)
    setIsCreating(true)
    try {
      await onConfirm(trimmed)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder')
    } finally {
      setIsCreating(false)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitFolder()
  }

  const closeDialog = React.useEffectEvent(() => onOpenChange(false))

  useHotkey(
    'Mod+Enter',
    () => {
      formRef.current?.requestSubmit()
    },
    { enabled: open },
  )

  useHotkey('Escape', closeDialog, { enabled: open })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form ref={formRef} onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
            <DialogDescription>
              Create <span className="font-medium">{optimisticFolderName}</span>{' '}
              in the current location.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              ref={inputRef}
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value)
                setOptimisticFolderName(e.target.value)
              }}
              placeholder="Folder name"
              autoFocus
              disabled={isCreating}
            />
          </div>

          <DialogFooter>
            <Activity when={Boolean(error)}>
              <p className="text-destructive mr-auto text-sm">{error}</p>
            </Activity>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
              <KeyboardShortcut keys="Escape" className="ml-2" />
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create'}
              <KeyboardShortcut keys="Mod+Enter" className="ml-2" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
