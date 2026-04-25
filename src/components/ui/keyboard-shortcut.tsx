'use client'

import { formatForDisplay } from '@tanstack/react-hotkeys'
import { cn } from '@/lib/utils'

type KeyboardShortcutProps = {
  keys: string
  className?: string
}

export function KeyboardShortcut({ keys, className }: KeyboardShortcutProps) {
  return (
    <kbd
      className={cn(
        'bg-muted text-muted-foreground inline-flex h-6 items-center rounded-md border px-2 text-[11px] font-medium tracking-wide',
        className,
      )}
    >
      {formatForDisplay(keys)}
    </kbd>
  )
}
