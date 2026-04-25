import { create } from 'zustand'

type KeyboardShortcutsState = {
  registeredKeys: string[]
  register: (keys: string[]) => void
}

export const useKeyboardShortcutsStore = create<KeyboardShortcutsState>(
  (set) => ({
    registeredKeys: [],
    register: (keys) => {
      set({ registeredKeys: [...new Set(keys)] })
    },
  }),
)
