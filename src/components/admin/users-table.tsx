import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState, useMemo, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/components/ui/sonner'
import { formatBytes } from '@/lib/format-bytes'
import type { AdminUser } from '@/lib/storage-provider-queries'

async function loadUpdateUserRoleFn() {
  const mod = await import('@/routes/_app/admin/-admin-server')
  return mod.updateUserRoleFn
}

type UserTableRow = AdminUser & { isUpdating?: boolean }

const columnHelper = createColumnHelper<UserTableRow>()

interface UsersTableProps {
  users: AdminUser[]
  onUserUpdate?: () => void
  selectedUsers?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
}

export function UsersTable({
  users,
  onUserUpdate,
  selectedUsers = [],
  onSelectionChange,
}: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set())
  const [data] = useState<UserTableRow[]>(users)
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const newSelection: Record<string, boolean> = {}
    for (const id of selectedUsers) {
      newSelection[id] = true
    }
    setRowSelection(newSelection)
  }, [selectedUsers])

  const columns = useMemo<ColumnDef<UserTableRow>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label="Select row"
          />
        ),
        size: 40,
      },
      columnHelper.accessor('name', {
        header: 'Name',
        size: 180,
        cell: (info) => (
          <div className="truncate font-medium text-foreground">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        size: 220,
        cell: (info) => (
          <div className="truncate text-sm text-muted-foreground">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.isAdmin, {
        id: 'role',
        header: 'Role',
        size: 120,
        cell: (info) => {
          const row = info.row.original
          const isAdmin = info.getValue()
          const isUpdating = updatingUsers.has(row.id)

          return (
            <Select
              value={isAdmin ? 'admin' : 'user'}
              onValueChange={(value) => {
                void handleRoleChange(row.id, value === 'admin')
              }}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          )
        },
      }),
      columnHelper.accessor('usedStorage', {
        header: 'Usage',
        size: 120,
        cell: (info) => (
          <div className="text-sm text-muted-foreground">
            {formatBytes(info.getValue())}
          </div>
        ),
      }),
      columnHelper.accessor('storageLimitBytes', {
        header: 'Allocated',
        size: 120,
        cell: (info) => (
          <div className="text-sm text-muted-foreground">
            {formatBytes(info.getValue())}
          </div>
        ),
      }),
      columnHelper.accessor('banned', {
        header: 'Status',
        size: 100,
        cell: (info) => {
          const isBanned = info.getValue()
          return (
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isBanned ? 'bg-destructive' : 'bg-green-500'
                }`}
              />
              <span className="text-xs font-medium text-muted-foreground">
                {isBanned ? 'Banned' : 'Active'}
              </span>
            </div>
          )
        },
      }),
      columnHelper.accessor('createdAt', {
        header: 'Joined',
        size: 120,
        cell: (info) => {
          const date = new Date(info.getValue())
          return (
            <div className="text-xs text-muted-foreground">
              {date.toLocaleDateString()}
            </div>
          )
        },
      }),
    ],
    [updatingUsers],
  )

  const filteredData = useMemo(() => {
    if (!globalFilter) return data

    const lowerFilter = globalFilter.toLowerCase()
    return data.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerFilter) ||
        user.email.toLowerCase().includes(lowerFilter),
    )
  }, [data, globalFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      setRowSelection((prev) => {
        const newSelection =
          typeof updater === 'function' ? updater(prev) : updater
        onSelectionChange?.(Object.keys(newSelection))
        return newSelection
      })
    },
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => row.id,
  })

  const handleRoleChange = async (userId: string, isAdmin: boolean) => {
    setUpdatingUsers((prev) => new Set([...prev, userId]))
    try {
      const updateUserRoleFn = await loadUpdateUserRoleFn()
      await updateUserRoleFn({ data: { userId, isAdmin } })
      toast.success('User role updated')
      onUserUpdate?.()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update user role'
      toast.error(message)
    } finally {
      setUpdatingUsers((prev) => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }
  }

  const selectedCount = table.getSelectedRowModel().rows.length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        {selectedCount > 0 && (
          <div className="text-sm font-medium text-muted-foreground">
            {selectedCount} selected
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
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-semibold text-foreground"
                    style={{ width: header.getSize() }}
                  >
                    <div
                      className={`flex items-center gap-2 ${
                        header.column.getCanSort()
                          ? 'cursor-pointer select-none'
                          : ''
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getCanSort() && (
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            header.column.getIsSorted() === 'desc'
                              ? 'rotate-180'
                              : header.column.getIsSorted() === 'asc'
                                ? ''
                                : 'text-muted-foreground/50'
                          }`}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
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

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {table.getRowModel().rows.length} of {data.length} users
        </div>
      </div>
    </div>
  )
}
