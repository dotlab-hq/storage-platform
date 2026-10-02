import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/sonner'
import { formatBytes } from '@/lib/format-bytes'

type ByteLimitDialogProps = {
  title: string
  description: string
  /** Prefills the input (e.g. the user's current limit). */
  initialBytes?: number
  /** Resolves true when saved; the dialog then closes. */
  onSubmit: (bytes: number) => Promise<boolean>
  onClose: () => void
}

/**
 * Asks for a byte limit (storage quota or max file size). Render it only
 * while it should be open; it stays open until the save has finished.
 */
export function ByteLimitDialog({
  title,
  description,
  initialBytes,
  onSubmit,
  onClose,
}: ByteLimitDialogProps) {
  const [input, setInput] = useState(
    initialBytes === undefined ? '' : String(initialBytes),
  )
  const [isSaving, setIsSaving] = useState(false)
  const bytes = Number(input)
  const isValid = input.trim() !== '' && Number.isFinite(bytes) && bytes > 0

  const submit = async () => {
    if (!isValid) {
      toast.error('Please enter a positive number of bytes')
      return
    }
    setIsSaving(true)
    const saved = await onSubmit(bytes)
    setIsSaving(false)
    if (saved) onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
        >
          <Input
            type="number"
            placeholder="Limit in bytes"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            {isValid ? formatBytes(bytes) : 'Enter a value in bytes'}
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Update'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
