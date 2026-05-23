'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/sonner'
import { revokeSessionSettingsFn } from './-settings-server'

type SessionRow = {
  id: string
  expiresAt: Date
  createdAt: Date
  ipAddress: string | null
  userAgent: string | null
}

type SessionDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: SessionRow | null
  currentSessionId: string | null
}

export function SessionDetailsDialog({
  open,
  onOpenChange,
  session,
  currentSessionId,
}: SessionDetailsDialogProps) {
  const router = useRouter()

  const revokeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await revokeSessionSettingsFn({ data: { sessionId } })
    },
    onSuccess: () => {
      toast.success('Session revoked.')
      onOpenChange(false)
      router.invalidate()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to revoke session.',
      )
    },
  })

  if (!session) return null

  const isCurrentSession = session.id === currentSessionId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
              <ShieldAlert className="text-primary size-5" />
            </div>
            <div>
              <DialogTitle>Session details</DialogTitle>
              <DialogDescription>
                Review session metadata and revoke access if needed.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-3 text-sm">
          <DetailRow label="Session ID" value={session.id} mono />
          <DetailRow label="Created" value={session.createdAt.toLocaleString()} />
          <DetailRow label="Expires" value={session.expiresAt.toLocaleString()} />
          <DetailRow label="IP address" value={session.ipAddress ?? 'Hidden'} mono />
          <DetailRow
            label="User agent"
            value={session.userAgent ?? 'Unknown device'}
          />
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-28 shrink-0">Status</span>
            <Badge variant={isCurrentSession ? 'default' : 'secondary'}>
              {isCurrentSession ? 'Current session' : 'Other session'}
            </Badge>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => revokeMutation.mutate(session.id)}
            disabled={revokeMutation.isPending}
          >
            Revoke session
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground w-28 shrink-0">{label}</span>
      <span className={mono ? 'font-mono text-xs break-all' : 'wrap-break-word'}>
        {value}
      </span>
    </div>
  )
}