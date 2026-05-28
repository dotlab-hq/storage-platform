import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type ConfirmActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  confirmVariant?: 'primary' | 'warning' | 'destructive'
  requiresConfirmation?: boolean
  confirmationLabel?: string
  isLoading?: boolean
}

const confirmVariantClasses: Record<
  NonNullable<ConfirmActionDialogProps['confirmVariant']>,
  string
> = {
  primary: '',
  warning:
    'border border-amber-500/50 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25',
  destructive:
    'border border-red-500/50 bg-red-500/15 text-red-200 hover:bg-red-500/25',
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  confirmVariant = 'primary',
  requiresConfirmation = false,
  confirmationLabel = 'I understand this action cannot be undone',
  isLoading = false,
}: ConfirmActionDialogProps) {
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!open) {
      setConfirmed(false)
    }
  }, [open])

  const confirmDisabled = isLoading || (requiresConfirmation && !confirmed)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-emerald-500/20 bg-background shadow-xl">
        <DialogHeader className="text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {requiresConfirmation && (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="h-4 w-4 rounded border border-emerald-500/40 bg-muted text-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
            />
            {confirmationLabel}
          </label>
        )}

        <DialogFooter className="flex w-full flex-row items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-emerald-500/30 bg-muted/40 text-emerald-100 hover:bg-emerald-500/10"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={confirmVariantClasses[confirmVariant]}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
