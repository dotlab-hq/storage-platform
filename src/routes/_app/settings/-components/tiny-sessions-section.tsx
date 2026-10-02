import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { Clock, Shield, TimerReset } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SettingsDataTable } from './settings-data-table'
import { SessionDetailsDialog } from './session-details-dialog'
import type { SessionRow } from './session-details-dialog'
import { settingsQuery } from './settings-query'
import { formatDateTime } from './format-date'

const columnHelper = createColumnHelper<SessionRow>()

const deviceColumn = columnHelper.accessor('userAgent', {
  header: 'Device',
  cell: (info) => (
    <div className="max-w-[20rem] truncate font-medium text-foreground">
      {info.getValue() ?? 'Unknown device'}
    </div>
  ),
})

const ipColumn = columnHelper.accessor('ipAddress', {
  header: 'IP',
  cell: (info) => (
    <div className="font-mono text-xs text-muted-foreground">
      {info.getValue() ?? 'Hidden'}
    </div>
  ),
})

const dateCell = (value: Date) => (
  <div className="text-sm text-muted-foreground">{formatDateTime(value)}</div>
)

const expiresColumn = columnHelper.accessor('expiresAt', {
  header: 'Expires',
  cell: (info) => dateCell(info.getValue()),
})

const activeColumns = [
  deviceColumn,
  ipColumn,
  expiresColumn,
  columnHelper.display({
    id: 'status',
    header: 'Status',
    cell: () => (
      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700">
        Active
      </Badge>
    ),
  }),
]

const recentColumns = [
  deviceColumn,
  columnHelper.accessor('createdAt', {
    header: 'Created',
    cell: (info) => dateCell(info.getValue()),
  }),
  ipColumn,
  expiresColumn,
]

/** Active and recent sign-in sessions; a row opens details with a revoke action. */
export function TinySessionsSection() {
  const { data: settings } = useSuspenseQuery(settingsQuery())
  const { active, recent } = settings.tinySessions
  const [selectedSession, setSelectedSession] = useState<SessionRow | null>(
    null,
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
              {active.length}
            </Badge>
          </div>
          <SettingsDataTable
            data={active}
            columns={activeColumns}
            emptyMessage="No active sessions found."
            onRowAction={setSelectedSession}
            rowActionLabel="Open active session details"
          />
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="size-5 text-muted-foreground" />
            <h3 className="font-medium">Recent Sessions</h3>
            <Badge variant="secondary" className="ml-auto">
              {recent.length}
            </Badge>
          </div>
          <SettingsDataTable
            data={recent}
            columns={recentColumns}
            emptyMessage="No recent sessions yet."
            onRowAction={setSelectedSession}
            rowActionLabel="Open recent session details"
          />
        </div>
      </div>

      {selectedSession && (
        <SessionDetailsDialog
          session={selectedSession}
          isCurrentSession={selectedSession.id === settings.currentSessionId}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </section>
  )
}
