import { useEffectEvent, useLayoutEffect } from 'react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useKeyboardShortcutsStore } from '@/stores/keyboard-shortcuts-store'

type ShortcutMap = Record<string, () => void>

export function useKeyboardShortcuts( shortcuts: ShortcutMap ) {
  const register = useKeyboardShortcutsStore( ( state ) => state.register )
  const setHandlers = useKeyboardShortcutsStore( ( state ) => state.setHandlers )
  const run = useKeyboardShortcutsStore( ( state ) => state.run )
  const runShortcut = useEffectEvent( ( key: string ) => run( key ) )

  useLayoutEffect( () => {
    setHandlers( shortcuts )
    register( Object.keys( shortcuts ) )
  }, [register, setHandlers, shortcuts] )

  useHotkey( 'Mod+A', () => runShortcut( 'mod+a' ), {
    enabled: Boolean( shortcuts['mod+a'] ),
  } )
  useHotkey( 'Escape', () => runShortcut( 'escape' ), {
    enabled: Boolean( shortcuts.escape ),
  } )
  useHotkey( 'Delete', () => runShortcut( 'delete' ), {
    enabled: Boolean( shortcuts.delete ),
  } )
}
