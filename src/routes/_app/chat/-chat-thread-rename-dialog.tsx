import { useEffect, useState } from 'react'
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
import type { ChatThreadSnapshot } from './-chat-types'

type ChatThreadRenameDialogProps = {
  open: boolean
  thread: ChatThreadSnapshot | null
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (title: string) => void
}

export function ChatThreadRenameDialog({
  open,
  thread,
  isPending,
  onOpenChange,
  onConfirm,
}: ChatThreadRenameDialogProps) {
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (thread) {
      setTitle(thread.title)
    }
  }, [thread])

  const trimmed = title.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Thread</DialogTitle>
          <DialogDescription>
            Give this conversation a clearer title for fast access in your
            sub-sidebar.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Thread title"
          maxLength={120}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(trimmed)}
            disabled={isPending || trimmed.length === 0}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
