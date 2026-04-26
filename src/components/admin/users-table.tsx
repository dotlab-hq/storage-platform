'use client'

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import { useState, useMemo, useCallback } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { AdminUser } from '@/lib/storage-provider-queries'
import { getColumns, type UserTableRow } from './users-table-columns'

interface UsersTableProps {
  users: AdminUser[]
  onRoleChange?: (userId: string, isAdmin: boolean) => Promise<void>
  onBan?: (userId: string, banned: boolean) => Promise<void>
  onDelete?: (userId: string) => Promise<void>
  onUpdateStorage?: (userId: string, storageLimitBytes: number) => Promise<void>
  selectedUsers?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  onViewUserFiles?: (user: AdminUser) => void
}

export function UsersTable({
  users,
  onRoleChange,
  onBan,
  onDelete,
  onUpdateStorage,
  selectedUsers = [],
  onSelectionChange,
  onViewUserFiles,
}: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set())
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {}
      selectedUsers.forEach((id) => {
        initial[id] = true
      })
      return initial
    },
  )

  const handleRoleChange = useCallback(
    async (userId: string, isAdmin: boolean) => {
      if (!onRoleChange) return
      setUpdatingUsers((prev) => new Set([...prev, userId]))
      try {
        await onRoleChange(userId, isAdmin)
      } finally {
        setUpdatingUsers((prev) => {
          const next = new Set(prev)
          next.delete(userId)
          return next
        })
      }
    },
    [onRoleChange],
  )

  const handleBan = useCallback(
    async (userId: string, banned: boolean) => {
      if (!onBan) return
      setUpdatingUsers((prev) => new Set([...prev, userId]))
      try {
        await onBan(userId, banned)
      } finally {
        setUpdatingUsers((prev) => {
          const next = new Set(prev)
          next.delete(userId)
          return next
        })
      }
    },
    [onBan],
  )

  const handleDelete = useCallback(
    async (userId: string) => {
      if (!onDelete) return
      setUpdatingUsers((prev) => new Set([...prev, userId]))
      try {
        await onDelete(userId)
      } finally {
        setUpdatingUsers((prev) => {
          const next = new Set(prev)
          next.delete(userId)
          return next
        })
      }
    },
    [onDelete],
  )

  const handleUpdateStorage = useCallback(
    async (userId: string, storageLimitBytes: number) => {
      if (!onUpdateStorage) return
      setUpdatingUsers((prev) => new Set([...prev, userId]))
      try {
        await onUpdateStorage(userId, storageLimitBytes)
      } finally {
        setUpdatingUsers((prev) => {
          const next = new Set(prev)
          next.delete(userId)
          return next
        })
      }
    },
    [onUpdateStorage],
  )

  const columns = useMemo(
    () =>
      getColumns({
        onRoleChange: handleRoleChange,
        onBan: handleBan,
        onDelete: handleDelete,
        onUpdateStorage: handleUpdateStorage,
        onViewUserFiles,
        updatingUsers,
      }),
    [
      handleRoleChange,
      handleBan,
      handleDelete,
      handleUpdateStorage,
      onViewUserFiles,
      updatingUsers,
    ],
  )

  const filteredData = useMemo(() => {
    if (!globalFilter) return users as UserTableRow[]

    const lowerFilter = globalFilter.toLowerCase()
    return (users as UserTableRow[]).filter(
      (user) =>
        user.name.toLowerCase().includes(lowerFilter) ||
        user.email.toLowerCase().includes(lowerFilter),
    )
  }, [users, globalFilter])

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
          Showing {table.getRowModel().rows.length} of {users.length} users
        </div>
      </div>
    </div>
  )
}
