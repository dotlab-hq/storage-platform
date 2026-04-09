import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ChatThreadSnapshot } from './-chat-types'

type ChatThreadDeleteDialogProps = {
  open: boolean
  thread: ChatThreadSnapshot | null
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ChatThreadDeleteDialog({
  open,
  thread,
  isPending,
  onOpenChange,
  onConfirm,
}: ChatThreadDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Thread?</DialogTitle>
          <DialogDescription>
            This removes <strong>{thread?.title ?? 'this thread'}</strong> from
            your chat sidebar.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
