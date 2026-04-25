import { create } from 'zustand'

type ShortcutAction = () => void

type KeyboardShortcutsState = {
  registeredKeys: string[]
  handlers: Partial<Record<string, ShortcutAction>>
  register: ( keys: string[] ) => void
  setHandlers: ( handlers: Partial<Record<string, ShortcutAction>> ) => void
  run: ( key: string ) => void
}

export const useKeyboardShortcutsStore = create<KeyboardShortcutsState>(
  ( set, get ) => ( {
    registeredKeys: [],
    handlers: {},
    register: ( keys ) => {
      set( { registeredKeys: [...new Set( keys )] } )
    },
    setHandlers: ( handlers ) => {
      set( { handlers } )
    },
    run: ( key ) => {
      get().handlers[key]?.()
    },
  } ),
)
