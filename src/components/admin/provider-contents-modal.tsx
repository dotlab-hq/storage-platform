import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/admin/search-bar'
import { ProviderContentsPanel } from '@/components/admin/provider-contents-panel'
import { useProviderContents } from './use-provider-contents'
import type { AdminProvider } from '@/lib/storage-provider-queries'

type ProviderContentsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: AdminProvider | null
}

export function ProviderContentsModal({
  open,
  onOpenChange,
  provider,
}: ProviderContentsModalProps) {
  const viewer = useProviderContents(provider?.id ?? null, open)

  const prefixLabel = viewer.prefix.length > 0 ? viewer.prefix : '/'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-w-7xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b bg-linear-to-br from-background via-background to-muted/20 px-6 py-5">
          <DialogTitle className="text-xl font-semibold">
            Provider contents
          </DialogTitle>
          <DialogDescription>
            Direct listing from the provider, split into folders and files.
          </DialogDescription>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-background/80 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Provider
              </p>
              <p className="truncate text-sm font-medium">
                {provider?.name ?? '-'}
              </p>
            </div>
            <div className="rounded-xl border bg-background/80 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Bucket
              </p>
              <p className="truncate text-sm font-medium">
                {provider?.bucketName ?? '-'}
              </p>
            </div>
            <div className="rounded-xl border bg-background/80 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Prefix
              </p>
              <p className="truncate text-sm font-medium">{prefixLabel}</p>
            </div>
          </div>
          <div className="mt-4 flex items-end">
            <SearchBar onSearch={(query) => viewer.setSearchQuery(query)} />
          </div>
        </DialogHeader>

        <ProviderContentsPanel viewer={viewer} />
      </DialogContent>
    </Dialog>
  )
}
