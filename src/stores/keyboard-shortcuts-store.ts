import { useStore } from '@tanstack/react-store'
import { Store } from '@tanstack/store'

type ShortcutAction = () => void

type KeyboardShortcutsState = {
  registeredKeys: string[]
  handlers: Partial<Record<string, ShortcutAction>>
}

type KeyboardShortcutsActions = {
  register: (keys: string[]) => void
  setHandlers: (handlers: Partial<Record<string, ShortcutAction>>) => void
  run: (key: string) => void
}

type KeyboardShortcutsSnapshot = KeyboardShortcutsState &
  KeyboardShortcutsActions

const initialState: KeyboardShortcutsState = {
  registeredKeys: [],
  handlers: {},
}

export const keyboardShortcutsStore =
  new Store<KeyboardShortcutsState>(initialState)

export const register = (keys: string[]): void => {
  keyboardShortcutsStore.setState((state) => ({
    ...state,
    registeredKeys: [...new Set(keys)],
  }))
}

export const setHandlers = (
  handlers: Partial<Record<string, ShortcutAction>>,
): void => {
  keyboardShortcutsStore.setState((state) => ({
    ...state,
    handlers,
  }))
}

export const run = (key: string): void => {
  keyboardShortcutsStore.state.handlers[key]?.()
}

const getSnapshot = (
  state: KeyboardShortcutsState,
): KeyboardShortcutsSnapshot => ({
  ...state,
  register,
  setHandlers,
  run,
})

export function useKeyboardShortcutsStore<T>(
  selector: (state: KeyboardShortcutsSnapshot) => T,
): T
export function useKeyboardShortcutsStore(): KeyboardShortcutsSnapshot
export function useKeyboardShortcutsStore<T>(
  selector?: (state: KeyboardShortcutsSnapshot) => T,
) {
  return useStore(keyboardShortcutsStore, (state) => {
    const snapshot = getSnapshot(state)
    return selector ? selector(snapshot) : snapshot
  })
}
