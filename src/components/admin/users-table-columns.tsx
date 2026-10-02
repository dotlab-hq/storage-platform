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
import type { AdminUser } from '@/lib/storage-provider-queries'
import { formatDate } from './format-date'
import { UserRowActionsDropdown } from './user-row-actions-dropdown'

/**
 * Per-user actions. Each resolves true on success and false on failure (the
 * failure has already been reported to the user), so callers never need to
 * catch.
 */
export type UserActions = {
  onRoleChange: (userId: string, isAdmin: boolean) => Promise<boolean>
  onBan: (userId: string, banned: boolean) => Promise<boolean>
  onDelete: (userId: string) => Promise<boolean>
  onUpdateStorage: (userId: string, bytes: number) => Promise<boolean>
  onUpdateFileSizeLimit: (userId: string, bytes: number) => Promise<boolean>
  onViewFiles: (user: AdminUser) => void
}

function MutedCell({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-muted-foreground">{children}</div>
}

/** Column definitions for the admin users table. */
export function getUserColumns(actions: UserActions): ColumnDef<AdminUser>[] {
  return [
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
    {
      accessorKey: 'name',
      header: 'Name',
      size: 180,
      cell: ({ row }) => (
        <div className="truncate font-medium text-foreground">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      size: 220,
      cell: ({ row }) => (
        <div className="truncate text-sm text-muted-foreground">
          {row.original.email}
        </div>
      ),
    },
    {
      id: 'role',
      accessorFn: (user) => user.isAdmin,
      header: 'Role',
      size: 120,
      cell: ({ row }) => (
        <Select
          value={row.original.isAdmin ? 'admin' : 'user'}
          onValueChange={(value) => {
            void actions.onRoleChange(row.original.id, value === 'admin')
          }}
        >
          <SelectTrigger className="h-8 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: 'usedStorage',
      header: 'Usage',
      size: 120,
      cell: ({ row }) => (
        <MutedCell>{formatBytes(row.original.usedStorage)}</MutedCell>
      ),
    },
    {
      accessorKey: 'storageLimitBytes',
      header: 'Allocated',
      size: 120,
      cell: ({ row }) => (
        <MutedCell>{formatBytes(row.original.storageLimitBytes)}</MutedCell>
      ),
    },
    {
      accessorKey: 'fileSizeLimitBytes',
      header: 'File Limit',
      size: 120,
      cell: ({ row }) => (
        <MutedCell>{formatBytes(row.original.fileSizeLimitBytes)}</MutedCell>
      ),
    },
    {
      accessorKey: 'banned',
      header: 'Status',
      size: 100,
      cell: ({ row }) => {
        const isBanned = row.original.banned
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
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      size: 120,
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <UserRowActionsDropdown user={row.original} actions={actions} />
        </div>
      ),
      size: 80,
    },
  ]
}
