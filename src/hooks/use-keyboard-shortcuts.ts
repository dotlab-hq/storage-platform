import { useEffectEvent } from 'react'
import { useHotkey } from '@tanstack/react-hotkeys'

type Shortcuts = {
  'mod+a'?: () => void
  escape?: () => void
  delete?: () => void
}

/**
 * Page-level keyboard shortcuts. Handlers may change every render; the
 * latest one always runs. They never fire (or block the browser default)
 * while the user is typing in a field, so Cmd/Ctrl+A still selects text.
 */
export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  const run = useEffectEvent((key: keyof Shortcuts) => shortcuts[key]?.())
  const options = (key: keyof Shortcuts) => ({
    enabled: !!shortcuts[key],
    ignoreInputs: true,
  })

  useHotkey('Mod+A', () => run('mod+a'), options('mod+a'))
  useHotkey('Escape', () => run('escape'), options('escape'))
  useHotkey('Delete', () => run('delete'), options('delete'))
}
