import { formatForDisplay } from '@tanstack/react-hotkeys'
import { useHydrated } from '@/hooks/use-hydrated'
import { cn } from '@/lib/utils'

type KeyboardShortcutProps = {
  keys: string
  className?: string
}

/**
 * Renders a shortcut like "Mod+Enter" as ⌘ ↵ or Ctrl+↵. The platform is only
 * known in the browser, so the server (and hydration) render the generic
 * Windows/Linux form first to avoid a hydration mismatch.
 */
export function KeyboardShortcut({ keys, className }: KeyboardShortcutProps) {
  const hydrated = useHydrated()
  return (
    <kbd
      className={cn(
        'bg-muted text-muted-foreground inline-flex h-6 items-center rounded-md border px-2 text-[11px] font-medium tracking-wide',
        className,
      )}
    >
      {formatForDisplay(keys, hydrated ? undefined : { platform: 'windows' })}
    </kbd>
  )
}
