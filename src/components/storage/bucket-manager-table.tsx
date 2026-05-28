import {
  Database,
  Eye,
  Eraser,
  KeyRound,
  Loader2,
  MoreVertical,
  Settings,
  Trash2,
} from 'lucide-react'
import type { S3BucketItem } from '@/types/s3-buckets'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type BucketManagerTableProps = {
  buckets: S3BucketItem[]
  pendingByBucket: Record<string, 'empty' | 'delete' | 'create' | undefined>
  onView: (bucketName: string) => void
  onSettings: (bucketName: string) => void
  onObjectOps: (bucketName: string) => void
  onCredentials: (bucketName: string) => Promise<void>
  onEmpty: (bucketName: string, isDefault: boolean | undefined) => Promise<void>
  onDelete: (
    bucketName: string,
    isDefault: boolean | undefined,
  ) => Promise<void>
}

function formatCreatedAt(value: string | null): string {
  if (!value) {
    return 'Unknown'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }
  return date.toLocaleString()
}

export function BucketManagerTable({
  buckets,
  pendingByBucket,
  onView,
  onSettings,
  onObjectOps,
  onCredentials,
  onEmpty,
  onDelete,
}: BucketManagerTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <Table>
        <TableHeader className="bg-muted/45">
          <TableRow>
            <TableHead className="w-[34%] px-3">Bucket</TableHead>
            <TableHead className="px-3">Created</TableHead>
            <TableHead className="px-3">Protection</TableHead>
            <TableHead className="px-3">Status</TableHead>
            <TableHead className="px-3 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buckets.map((bucket) => {
            const pendingAction = pendingByBucket[bucket.name]
            const isPending = Boolean(pendingAction)
            return (
              <TableRow key={bucket.id}>
                <TableCell className="px-3">
                  <button
                    onClick={() => onView(bucket.name)}
                    className="max-w-[22rem] truncate font-medium underline-offset-4 hover:underline"
                  >
                    {bucket.name}
                  </button>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {bucket.mappedFolderId
                      ? `Folder ${bucket.mappedFolderId}`
                      : 'Root storage namespace'}
                  </p>
                </TableCell>
                <TableCell className="px-3 text-muted-foreground">
                  {formatCreatedAt(bucket.createdAt)}
                </TableCell>
                <TableCell className="px-3">
                  {bucket.isDefault ? (
                    <Badge variant="outline">Default locked</Badge>
                  ) : (
                    <Badge variant="secondary">Mutable</Badge>
                  )}
                </TableCell>
                <TableCell className="px-3">
                  {isPending ? (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="capitalize">{pendingAction}...</span>
                    </span>
                  ) : (
                    <Badge
                      variant={bucket.isActive ? 'outline' : 'destructive'}
                    >
                      {bucket.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="px-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => onView(bucket.name)}
                  >
                    <Eye className="h-4 w-4" />
                    Objects
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="ml-1"
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem onClick={() => onView(bucket.name)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Objects
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSettings(bucket.name)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onObjectOps(bucket.name)}
                      >
                        <Database className="mr-2 h-4 w-4" />
                        Object Operations
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          await onCredentials(bucket.name)
                        }}
                      >
                        <KeyRound className="mr-2 h-4 w-4" />
                        Credentials
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={async () => {
                          await onEmpty(bucket.name, bucket.isDefault)
                        }}
                        disabled={bucket.isDefault}
                      >
                        <Eraser className="mr-2 h-4 w-4" />
                        Empty Bucket
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          await onDelete(bucket.name, bucket.isDefault)
                        }}
                        disabled={bucket.isDefault}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Bucket
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
