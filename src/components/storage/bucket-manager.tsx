import { useEffect, useMemo, useState } from 'react'
import {
  Loader2,
  Plus,
  RefreshCw,
  MoreVertical,
  Eye,
  KeyRound,
  Settings,
  Database,
  Eraser,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BucketCredentialsDialog } from '@/components/storage/bucket-credentials-dialog'
import { BucketSettingsDialog } from '@/components/storage/bucket-settings-dialog'
import { ObjectOperationsDialog } from '@/components/storage/object-operations-dialog'
import { S3ViewerModal } from '@/components/storage/s3-viewer-modal'
import { useS3Buckets } from '@/hooks/use-s3-buckets'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import type { S3BucketItem } from '@/types/s3-buckets'

export function BucketManager() {
  const [bucketName, setBucketName] = useState<string>('')
  const [activeCredentialsBucket, setActiveCredentialsBucket] = useState<
    string | null
  >(null)
  const [activeSettingsBucket, setActiveSettingsBucket] = useState<
    string | null
  >(null)
  const [activeObjectOpsBucket, setActiveObjectOpsBucket] = useState<
    string | null
  >(null)
  const [activeViewerBucket, setActiveViewerBucket] = useState<string | null>(
    null,
  )
  const {
    buckets,
    isLoading,
    isRefreshing,
    isCreating,
    pendingByBucket,
    credentialByBucket,
    error,
    hasBuckets,
    refreshBuckets,
    createNewBucket,
    runBucketAction,
    fetchCredentials,
  } = useS3Buckets()

  useEffect(() => {
    void refreshBuckets()
  }, [refreshBuckets])

  const createDisabled = useMemo(() => {
    return bucketName.trim().length < 3 || isCreating
  }, [bucketName, isCreating])

  const handleCreate = async () => {
    const created = await createNewBucket(bucketName)
    if (created) {
      setBucketName('')
    }
  }

  const handleEmpty = async (name: string) => {
    const confirmed = window.confirm(`Empty all objects in bucket "${name}"?`)
    if (!confirmed) {
      return
    }
    await runBucketAction(name, 'empty')
  }

  const handleDelete = async (name: string) => {
    const confirmed = window.confirm(
      `Delete bucket "${name}"? Bucket must be empty.`,
    )
    if (!confirmed) {
      return
    }
    await runBucketAction(name, 'delete')
  }

  const copyValue = async (value: string) => {
    await navigator.clipboard.writeText(value)
  }

  const openCredentialsDialog = async (name: string) => {
    const credentials = await fetchCredentials(name)
    if (credentials) {
      setActiveCredentialsBucket(name)
    }
  }

  const activeCredentials = activeCredentialsBucket
    ? credentialByBucket[activeCredentialsBucket]
    : undefined

  const columns = useMemo<ColumnDef<S3BucketItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => (
          <button
            onClick={() => setActiveViewerBucket(info.row.original.name)}
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            {info.getValue() as string}
          </button>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: (info) => {
          const val = info.getValue() as string | null
          if (!val) return 'Unknown'
          const date = new Date(val)
          return Number.isNaN(date.getTime())
            ? 'Unknown'
            : date.toLocaleString()
        },
      },
      {
        accessorKey: 'provider',
        header: 'Provider',
        cell: (info) => (info.getValue() as string) || 'Default',
      },
      {
        id: 'status',
        header: 'Status',
        cell: (info) => {
          const bucket = info.row.original
          const pendingAction = pendingByBucket[bucket.name]
          if (pendingAction) {
            return (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="capitalize">{pendingAction}...</span>
              </div>
            )
          }
          return (
            <span className="text-sm text-green-600 dark:text-green-400">
              Active
            </span>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const bucket = info.row.original
          const isPending = !!pendingByBucket[bucket.name]

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isPending}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => setActiveViewerBucket(bucket.name)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Objects
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveSettingsBucket(bucket.name)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveObjectOpsBucket(bucket.name)}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Object Operations
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void openCredentialsDialog(bucket.name)}
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Credentials
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => void handleEmpty(bucket.name)}
                  className="text-orange-600 dark:text-orange-400 focus:text-orange-600"
                >
                  <Eraser className="mr-2 h-4 w-4" />
                  Empty Bucket
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void handleDelete(bucket.name)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Bucket
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [pendingByBucket],
  )

  const table = useReactTable({
    data: buckets || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <section className="space-y-4 rounded-xl border bg-linear-to-br from-blue-50/50 via-purple-50/30 to-background dark:from-blue-950/20 dark:via-purple-950/10 dark:to-background p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">S3 Buckets</h2>
          <p className="text-muted-foreground text-sm">
            Create virtual buckets and issue platform credentials. Files are
            tracked in your platform bucket mapping.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void refreshBuckets()}
          disabled={isRefreshing || isLoading}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={bucketName}
          onChange={(event) => setBucketName(event.target.value)}
          placeholder="new-bucket-name"
          className="sm:max-w-sm"
        />
        <Button onClick={() => void handleCreate()} disabled={createDisabled}>
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Create Bucket
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-muted-foreground py-8 text-sm">
          Loading buckets...
        </div>
      )}

      {!isLoading && !hasBuckets && (
        <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
          No virtual buckets found for your account.
        </div>
      )}

      {!isLoading && hasBuckets && (
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <BucketCredentialsDialog
        bucketName={activeCredentialsBucket}
        credentials={activeCredentials}
        onCopy={copyValue}
        onOpenChange={(open) => {
          if (!open) {
            setActiveCredentialsBucket(null)
          }
        }}
      />

      <BucketSettingsDialog
        bucketName={activeSettingsBucket}
        onOpenChange={(open) => {
          if (!open) setActiveSettingsBucket(null)
        }}
      />

      <ObjectOperationsDialog
        bucketName={activeObjectOpsBucket}
        onOpenChange={(open) => {
          if (!open) setActiveObjectOpsBucket(null)
        }}
      />

      <S3ViewerModal
        open={activeViewerBucket !== null}
        bucketName={activeViewerBucket}
        onOpenChange={(open) => {
          if (!open) {
            setActiveViewerBucket(null)
          }
        }}
      />
    </section>
  )
}
