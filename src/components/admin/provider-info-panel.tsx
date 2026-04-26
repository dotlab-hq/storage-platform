import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatBytes } from '@/lib/format-bytes'
import type { AdminProvider } from '@/lib/storage-provider-queries'

type CopyButtonProps = {
  value: string
  label: string
}

function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3 rounded-md border bg-background/50 p-3">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p
                className="line-clamp-1 break-all text-sm font-medium"
                title={value}
              >
                {value}
              </p>
            </TooltipTrigger>
            <TooltipContent className="max-w-md break-all">
              {value}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={handleCopy}
        aria-label={`Copy ${label}`}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}

export function ProviderInfoPanel({
  provider,
}: {
  provider: AdminProvider | null
}) {
  if (!provider)
    return (
      <div className="p-6 text-sm text-muted-foreground">
        No provider selected
      </div>
    )

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="grid gap-4 sm:grid-cols-2">
        <CopyButton value={provider.name} label="Provider Name" />
        <CopyButton value={provider.id} label="Provider ID" />
        <CopyButton value={provider.endpoint} label="Endpoint" />
        <CopyButton value={provider.region} label="Region" />
        <CopyButton value={provider.bucketName} label="Bucket Name" />
        <div className="rounded-md border p-3 bg-background/50 space-y-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Status
          </p>
          <p className="text-sm font-medium">
            {provider.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Storage Limits</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border p-3 bg-background/50 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Total Limit
            </p>
            <p className="text-sm font-medium">
              {formatBytes(provider.storageLimitBytes)}
            </p>
          </div>
          <div className="rounded-md border p-3 bg-background/50 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Used Storage
            </p>
            <p className="text-sm font-medium">
              {formatBytes(provider.usedStorageBytes)}
            </p>
          </div>
          <div className="rounded-md border p-3 bg-background/50 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Available Storage
            </p>
            <p className="text-sm font-medium">
              {formatBytes(provider.availableStorageBytes)}
            </p>
          </div>
          {!provider.hideInSidebar && (
            <div className="rounded-md border p-3 bg-background/50 space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Max File Size
              </p>
              <p className="text-sm font-medium">
                {formatBytes(provider.fileSizeLimitBytes)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
