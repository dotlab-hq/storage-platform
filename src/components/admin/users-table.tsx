import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { RowSelectionState, SortingState } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { AdminUser } from '@/lib/storage-provider-queries'
import { getUserColumns } from './users-table-columns'
import type { UserActions } from './users-table-columns'

type UsersTableProps = {
  users: AdminUser[]
  actions: UserActions
  /** Controlled selection (user ids). */
  selectedIds: string[]
  onSelectionChange: (selectedIds: string[]) => void
}

/** Sortable, searchable table of users with row selection. */
export function UsersTable({
  users,
  actions,
  selectedIds,
  onSelectionChange,
}: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [filter, setFilter] = useState('')

  const columns = useMemo(() => getUserColumns(actions), [actions])

  const filteredUsers = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    if (!needle) return users
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle),
    )
  }, [users, filter])

  const rowSelection = useMemo<RowSelectionState>(
    () => Object.fromEntries(selectedIds.map((id) => [id, true])),
    [selectedIds],
  )

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(rowSelection) : updater
      onSelectionChange(Object.keys(next).filter((id) => next[id]))
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  })

  const rows = table.getRowModel().rows

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="pl-8"
          />
        </div>
        {selectedIds.length > 0 && (
          <div className="text-sm font-medium text-muted-foreground">
            {selectedIds.length} selected
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border/50 bg-muted/30"
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left font-semibold text-foreground"
                      style={{ width: header.getSize() }}
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          canSort ? 'cursor-pointer select-none' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {canSort && (
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              sorted === 'desc'
                                ? 'rotate-180'
                                : sorted === 'asc'
                                  ? ''
                                  : 'text-muted-foreground/50'
                            }`}
                          />
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/30 transition-colors hover:bg-muted/20"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {rows.length} of {users.length} users
      </div>
    </div>
  )
}
