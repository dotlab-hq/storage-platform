import { useEffect } from 'react'
import { create } from 'zustand'

export type ShellAction = {
  id: string
  label: string
  onSelect: () => void
  destructive?: boolean
}

export type ShellView = 'home' | 'recent' | 'trash' | 'chat' | 'other'

export type ShellViewConfig = {
  commandActions: ShellAction[]
  contextActions: ShellAction[]
}

const EMPTY_CONFIG: ShellViewConfig = { commandActions: [], contextActions: [] }

/**
 * Commands the current page offers in the Cmd/Ctrl+K palette and the
 * right-click menu. Pages register with `useShellView`; the global shell
 * (`global-shell-actions.tsx`) reads the active config.
 */
type ShellActionsState = {
  activeView: ShellView
  configs: Partial<Record<ShellView, ShellViewConfig>>
}

export const useShellActionsStore = create<ShellActionsState>(() => ({
  activeView: 'other',
  configs: {},
}))

export function getActiveConfig(): ShellViewConfig {
  const { activeView, configs } = useShellActionsStore.getState()
  return configs[activeView] ?? EMPTY_CONFIG
}

export function useActiveShellConfig(): ShellViewConfig {
  return useShellActionsStore(
    (state) => state.configs[state.activeView] ?? EMPTY_CONFIG,
  )
}

/** Registers a page's shell actions while the calling component is mounted. */
export function useShellView(view: ShellView, config: ShellViewConfig) {
  useEffect(() => {
    useShellActionsStore.setState((state) => ({
      activeView: view,
      configs: { ...state.configs, [view]: config },
    }))
    return () => {
      useShellActionsStore.setState((state) => {
        const { [view]: _removed, ...configs } = state.configs
        return {
          configs,
          activeView: state.activeView === view ? 'other' : state.activeView,
        }
      })
    }
  }, [view, config])
}
