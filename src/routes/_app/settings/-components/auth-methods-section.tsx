import { useMemo } from 'react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Key, Shield, UserRoundCog } from 'lucide-react'
import { SettingsDataTable } from './settings-data-table'

type AuthMethodRow = {
  id: string
  providerId: string
  accountId: string
  createdAt: Date
}

const columnHelper = createColumnHelper<AuthMethodRow>()

export function AuthMethodsSection({
  initial,
}: {
  initial: {
    user: { role: string }
    methods: AuthMethodRow[]
  }
}) {
  const columns = useMemo<ColumnDef<AuthMethodRow>[]>(
    () => [
      columnHelper.accessor('providerId', {
        header: 'Provider',
        size: 160,
        cell: (info) => (
          <div className="font-medium capitalize text-foreground">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('accountId', {
        header: 'Account ID',
        size: 260,
        cell: (info) => (
          <div className="max-w-[18rem] truncate font-mono text-xs text-muted-foreground">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Linked',
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
        size: 140,
        cell: () => (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">
              Active
            </span>
          </div>
        ),
      },
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
            <h2 className="text-lg font-semibold">Authentication Methods</h2>
            <p className="text-muted-foreground text-sm">
              Connected sign-in providers and linked credentials
            </p>
          </div>
        </div>
        <div>
          <Badge variant="secondary" className="gap-2 px-3 py-1.5">
            <UserRoundCog className="size-4" />
            {initial.user.role}
          </Badge>
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-9 items-center justify-center rounded-full">
              <Key className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Linked Methods
              </p>
              <p className="text-xl font-semibold">{initial.methods.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-9 items-center justify-center rounded-full">
              <Shield className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Most Recent
              </p>
              <p className="text-xl font-semibold">
                {initial.methods[0]
                  ? new Date(initial.methods[0].createdAt).toLocaleDateString()
                  : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <SettingsDataTable
        data={initial.methods}
        columns={columns}
        emptyMessage="No authentication methods linked yet."
      />
    </section>
  )
}
