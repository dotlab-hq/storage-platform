import { useMemo, useState } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Clock, Shield, TimerReset } from 'lucide-react'
import { SettingsDataTable } from './settings-data-table'
import { SessionDetailsDialog } from './session-details-dialog'

type SessionRow = {
  id: string
  expiresAt: Date
  createdAt: Date
  ipAddress: string | null
  userAgent: string | null
}

const columnHelper = createColumnHelper<SessionRow>()

export function TinySessionsSection({
  initial,
}: {
  initial: {
    currentSessionId: string | null
    tinySessions: {
      active: SessionRow[]
      recent: SessionRow[]
    }
  }
}) {
  const [selectedSession, setSelectedSession] = useState<SessionRow | null>(null)

  const activeColumns = useMemo<ColumnDef<SessionRow>[]>(
    () => [
      columnHelper.accessor('userAgent', {
        header: 'Device',
        size: 320,
        cell: (info) => (
          <div className="max-w-[20rem] truncate font-medium text-foreground">
            {info.getValue() ?? 'Unknown device'}
          </div>
        ),
      }),
      columnHelper.accessor('ipAddress', {
        header: 'IP',
        size: 160,
        cell: (info) => (
          <div className="font-mono text-xs text-muted-foreground">
            {info.getValue() ?? 'Hidden'}
          </div>
        ),
      }),
      columnHelper.accessor('expiresAt', {
        header: 'Expires',
        size: 180,
        cell: (info) => (
          <div className="text-sm text-muted-foreground">
            {new Date(info.getValue()).toLocaleString()}
          </div>
        ),
      }),
      {
        id: 'status',
        header: 'Status',
        size: 120,
        cell: () => (
          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-700"
          >
            Active
          </Badge>
        ),
      },
    ],
    [],
  )

  const recentColumns = useMemo<ColumnDef<SessionRow>[]>(
    () => [
      columnHelper.accessor('userAgent', {
        header: 'Device',
        size: 320,
        cell: (info) => (
          <div className="max-w-[20rem] truncate font-medium text-foreground">
            {info.getValue() ?? 'Unknown device'}
          </div>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        size: 180,
        cell: (info) => (
          <div className="text-sm text-muted-foreground">
            {new Date(info.getValue()).toLocaleString()}
          </div>
        ),
      }),
      columnHelper.accessor('ipAddress', {
        header: 'IP',
        size: 160,
        cell: (info) => (
          <div className="font-mono text-xs text-muted-foreground">
            {info.getValue() ?? 'Hidden'}
          </div>
        ),
      }),
      columnHelper.accessor('expiresAt', {
        header: 'Expires',
        size: 180,
        cell: (info) => (
          <div className="text-sm text-muted-foreground">
            {new Date(info.getValue()).toLocaleString()}
          </div>
        ),
      }),
    ],
    [],
  )

  return (
    <section className="overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-background via-background to-muted/20 p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
            <Shield className="text-primary size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Sessions</h2>
            <p className="text-muted-foreground text-sm">
              Active devices and recently issued sessions
            </p>
          </div>
        </div>
        <div>
          <Badge variant="secondary" className="gap-2 px-3 py-1.5">
            <TimerReset className="size-4" />
            Session visibility on
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10">
              <span className="size-2 rounded-full bg-emerald-500" />
            </div>
            <h3 className="font-medium">Active Sessions</h3>
            <Badge variant="secondary" className="ml-auto">
              {initial.tinySessions.active.length}
            </Badge>
          </div>
          <SettingsDataTable
            data={initial.tinySessions.active}
            columns={activeColumns}
            emptyMessage="No active sessions found."
            onRowAction={(session) => setSelectedSession(session)}
            rowActionLabel="Open active session details"
          />
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="size-5 text-muted-foreground" />
            <h3 className="font-medium">Recent Sessions</h3>
            <Badge variant="secondary" className="ml-auto">
              {initial.tinySessions.recent.length}
            </Badge>
          </div>
          <SettingsDataTable
            data={initial.tinySessions.recent}
            columns={recentColumns}
            emptyMessage="No recent sessions yet."
            onRowAction={(session) => setSelectedSession(session)}
            rowActionLabel="Open recent session details"
          />
        </div>
      </div>

      <SessionDetailsDialog
        open={selectedSession !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSession(null)
        }}
        session={selectedSession}
        currentSessionId={initial.currentSessionId}
      />
    </section>
  )
}
