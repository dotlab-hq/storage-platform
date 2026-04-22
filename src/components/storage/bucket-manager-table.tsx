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
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/45">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Name</th>
            <th className="px-3 py-2 text-left font-medium">Created</th>
            <th className="px-3 py-2 text-left font-medium">Status</th>
            <th className="px-3 py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((bucket) => {
            const pendingAction = pendingByBucket[bucket.name]
            const isPending = Boolean(pendingAction)
            return (
              <tr key={bucket.id} className="border-t border-border/70">
                <td className="px-3 py-2">
                  <button
                    onClick={() => onView(bucket.name)}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {bucket.name}
                  </button>
                  {bucket.isDefault ? (
                    <span className="ml-2 rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                      default
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {formatCreatedAt(bucket.createdAt)}
                </td>
                <td className="px-3 py-2">
                  {isPending ? (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="capitalize">{pendingAction}...</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded border border-border px-2 py-0.5 text-xs">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isPending}>
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
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
