import { Loader2, Plus, RefreshCw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type BucketManagerToolbarProps = {
  bucketName: string
  searchQuery: string
  isCreating: boolean
  isLoading: boolean
  isRefreshing: boolean
  createDisabled: boolean
  onBucketNameChange: (value: string) => void
  onSearchQueryChange: (value: string) => void
  onCreate: () => Promise<void>
  onRefresh: () => Promise<unknown>
}

export function BucketManagerToolbar(props: BucketManagerToolbarProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-border/80 bg-muted/20 p-3 lg:grid-cols-[1fr_auto]">
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          value={props.bucketName}
          onChange={(event) => props.onBucketNameChange(event.target.value)}
          placeholder="new-bucket-name"
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={props.searchQuery}
            onChange={(event) => props.onSearchQueryChange(event.target.value)}
            className="pl-8"
            placeholder="Search buckets"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 lg:justify-end">
        <Button
          variant="outline"
          onClick={() => void props.onRefresh()}
          disabled={props.isRefreshing || props.isLoading}
          className="gap-2"
        >
          {props.isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
        <Button
          onClick={() => void props.onCreate()}
          disabled={props.createDisabled}
          className="gap-2"
        >
          {props.isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Create Bucket
        </Button>
      </div>
    </div>
  )
}
