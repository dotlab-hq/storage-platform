import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
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
import { CURRENT_USER_QUERY_KEY } from '@/lib/auth/current-user'
import { revokeSessionSettingsFn } from './settings-auth'
import { refreshSettings } from './settings-query'
import type { SettingsSnapshot } from './settings-query'
import { formatDateTime } from './format-date'

export type SessionRow = SettingsSnapshot['tinySessions']['active'][number]

type SessionDetailsDialogProps = {
  session: SessionRow
  isCurrentSession: boolean
  onClose: () => void
}

/** Session metadata with a revoke button. Mounted only while open. */
export function SessionDetailsDialog({
  session,
  isCurrentSession,
  onClose,
}: SessionDetailsDialogProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const revoke = useMutation({
    mutationFn: () =>
      revokeSessionSettingsFn({ data: { sessionId: session.id } }),
    onSuccess: () => {
      toast.success('Session revoked.')
      onClose()
      // Revoking this browser's own session signs it out.
      if (isCurrentSession) {
        queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY })
        void navigate({ to: '/auth' })
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to revoke session.',
      )
    },
    onSettled: () => {
      if (!isCurrentSession) void refreshSettings(queryClient)
    },
  })

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !revoke.isPending) onClose()
      }}
    >
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
          <DetailRow
            label="Created"
            value={formatDateTime(session.createdAt)}
          />
          <DetailRow
            label="Expires"
            value={formatDateTime(session.expiresAt)}
          />
          <DetailRow
            label="IP address"
            value={session.ipAddress ?? 'Hidden'}
            mono
          />
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
            onClick={() => revoke.mutate()}
            disabled={revoke.isPending}
          >
            {revoke.isPending ? 'Revoking...' : 'Revoke session'}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={revoke.isPending}
          >
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
      <span
        className={mono ? 'font-mono text-xs break-all' : 'wrap-break-word'}
      >
        {value}
      </span>
    </div>
  )
}
