import { useEffectEvent, useLayoutEffect } from 'react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useKeyboardShortcutsStore } from '@/stores/keyboard-shortcuts-store'

type ShortcutMap = Record<string, () => void>

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const register = useKeyboardShortcutsStore((state) => state.register)
  const runSelectAll = useEffectEvent(() => shortcuts['mod+a']?.())
  const runEscape = useEffectEvent(() => shortcuts.escape?.())
  const runDelete = useEffectEvent(() => shortcuts.delete?.())

  useLayoutEffect(() => {
    register(Object.keys(shortcuts))
  }, [register, shortcuts])

  useHotkey('Mod+A', runSelectAll, { enabled: Boolean(shortcuts['mod+a']) })
  useHotkey('Escape', runEscape, { enabled: Boolean(shortcuts.escape) })
  useHotkey('Delete', runDelete, { enabled: Boolean(shortcuts.delete) })
}
