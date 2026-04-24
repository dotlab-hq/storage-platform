'use client'

import * as React from 'react'
import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { StatsPanel } from '@/components/stats-panel'

const STATS_PANEL_OPEN_KEY = 'dot_stats_panel_open'

export function StatsDropdown({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem(STATS_PANEL_OPEN_KEY)
    if (stored !== null) {
      setOpen(stored === 'true')
    }
  }, [])

  const onOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    localStorage.setItem(STATS_PANEL_OPEN_KEY, String(newOpen))
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant={open ? 'default' : 'ghost'}
          aria-label={open ? 'Hide stats' : 'Show stats'}
          className={className}
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="end">
        <StatsPanel />
      </PopoverContent>
    </Popover>
  )
}
