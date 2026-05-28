import { useState  } from 'react'
import type {ReactNode} from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

type BucketManagerSectionProps = {
  title: string
  description?: string
  defaultOpen?: boolean
  action?: ReactNode
  children: ReactNode
}

export function BucketManagerSection({
  title,
  description,
  defaultOpen = true,
  action,
  children,
}: BucketManagerSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="rounded-xl border border-border/60 bg-background/60 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {action}
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className="gap-1 border-border/60 bg-muted/30 text-foreground hover:bg-muted/50"
          >
            {open ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {open ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>
      {open ? <div className="p-4">{children}</div> : null}
    </section>
  )
}
