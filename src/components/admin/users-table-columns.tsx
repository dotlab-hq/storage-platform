'use client'

import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatBytes } from '@/lib/format-bytes'
import { UserRowActionsDropdown } from './user-row-actions-dropdown'
import type { AdminUser } from '@/lib/storage-provider-queries'

export type UserTableRow = AdminUser & { isUpdating?: boolean }
const columnHelper = createColumnHelper<UserTableRow>()

interface ColumnCallbacks {
  onRoleChange?: (userId: string, isAdmin: boolean) => Promise<void>
  onBan?: (userId: string, banned: boolean) => Promise<void>
  onDelete?: (userId: string) => Promise<void>
  onUpdateStorage?: (userId: string, storageLimitBytes: number) => Promise<void>
  onUpdateFileSizeLimit?: (
    userId: string,
    fileSizeLimitBytes: number,
  ) => Promise<void>
  onViewUserFiles?: (user: UserTableRow) => void
  updatingUsers?: Set<string>
}

export const getColumns = ({
  onRoleChange,
  onBan,
  onDelete,
  onUpdateStorage,
  onUpdateFileSizeLimit,
  onViewUserFiles,
  updatingUsers = new Set(),
}: ColumnCallbacks): ColumnDef<UserTableRow>[] => [
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
  }) as ColumnDef<UserTableRow>,
  columnHelper.accessor('email', {
    header: 'Email',
    size: 220,
    cell: (info) => (
      <div className="truncate text-sm text-muted-foreground">
        {info.getValue()}
      </div>
    ),
  }) as ColumnDef<UserTableRow>,
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
            if (onRoleChange) {
              void onRoleChange(row.id, value === 'admin')
            }
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
  }) as ColumnDef<UserTableRow>,
  columnHelper.accessor('usedStorage', {
    header: 'Usage',
    size: 120,
    cell: (info) => (
      <div className="text-sm text-muted-foreground">
        {formatBytes(info.getValue())}
      </div>
    ),
  }) as ColumnDef<UserTableRow>,
  columnHelper.accessor('storageLimitBytes', {
    header: 'Allocated',
    size: 120,
    cell: (info) => (
      <div className="text-sm text-muted-foreground">
        {formatBytes(info.getValue())}
      </div>
    ),
  }) as ColumnDef<UserTableRow>,
  columnHelper.accessor('fileSizeLimitBytes', {
    header: 'File Limit',
    size: 120,
    cell: (info) => (
      <div className="text-sm text-muted-foreground">
        {formatBytes(info.getValue())}
      </div>
    ),
  }) as ColumnDef<UserTableRow>,
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
  }) as ColumnDef<UserTableRow>,
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
  }) as ColumnDef<UserTableRow>,
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex justify-end">
          <UserRowActionsDropdown
            user={user}
            onViewFiles={() => onViewUserFiles?.(user)}
            onRoleChange={
              onRoleChange
                ? () => onRoleChange(user.id, !user.isAdmin)
                : undefined
            }
            onBan={onBan ? (banned) => onBan(user.id, banned) : undefined}
            onDelete={onDelete ? () => onDelete(user.id) : undefined}
            onUpdateStorage={
              onUpdateStorage
                ? (bytes) => onUpdateStorage(user.id, bytes)
                : undefined
            }
            onUpdateFileSizeLimit={
              onUpdateFileSizeLimit
                ? (bytes) => onUpdateFileSizeLimit(user.id, bytes)
                : undefined
            }
          />
        </div>
      )
    },
    size: 80,
  } as ColumnDef<UserTableRow>,
]
