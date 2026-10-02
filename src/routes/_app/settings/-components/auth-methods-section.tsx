import { useSuspenseQuery } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { CheckCircle2, Key, Shield, UserRoundCog } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SettingsDataTable } from './settings-data-table'
import { settingsQuery } from './settings-query'
import type { SettingsSnapshot } from './settings-query'
import { formatDate, formatDateTime } from './format-date'

type AuthMethodRow = SettingsSnapshot['methods'][number]

const columnHelper = createColumnHelper<AuthMethodRow>()

const columns = [
  columnHelper.accessor('providerId', {
    header: 'Provider',
    cell: (info) => (
      <div className="font-medium capitalize text-foreground">
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor('accountId', {
    header: 'Account ID',
    cell: (info) => (
      <div className="max-w-[18rem] truncate font-mono text-xs text-muted-foreground">
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor('createdAt', {
    header: 'Linked',
    cell: (info) => (
      <div className="text-sm text-muted-foreground">
        {formatDateTime(info.getValue())}
      </div>
    ),
  }),
  columnHelper.display({
    id: 'status',
    header: 'Status',
    cell: () => (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="size-4 text-emerald-500" />
        <span className="text-sm font-medium text-emerald-600">Active</span>
      </div>
    ),
  }),
]

/** Lists the sign-in methods (password, OAuth providers) linked to the account. */
export function AuthMethodsSection() {
  const { data: settings } = useSuspenseQuery(settingsQuery())
  const { methods } = settings

  return (
    <section className="overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-background via-background to-muted/20 p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
            <Shield className="text-primary size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Authentication Methods</h2>
            <p className="text-muted-foreground text-sm">
              Connected sign-in providers and linked credentials
            </p>
          </div>
        </div>
        <div>
          <Badge variant="secondary" className="gap-2 px-3 py-1.5">
            <UserRoundCog className="size-4" />
            {settings.user.role}
          </Badge>
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={<Key className="size-4 text-muted-foreground" />}
          label="Linked Methods"
          value={methods.length}
        />
        <StatCard
          icon={<Shield className="size-4 text-muted-foreground" />}
          label="Most Recent"
          value={methods[0] ? formatDate(methods[0].createdAt) : 'None'}
        />
      </div>

      <SettingsDataTable
        data={methods}
        columns={columns}
        emptyMessage="No authentication methods linked yet."
      />
    </section>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
      <div className="flex items-center gap-3">
        <div className="bg-muted flex size-9 items-center justify-center rounded-full">
          {icon}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  )
}
