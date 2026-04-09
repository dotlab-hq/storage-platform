'use client'

import { useEffect } from 'react'

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

const DEFAULT_CONFIG: ShellViewConfig = {
  commandActions: [],
  contextActions: [],
}

let activeView: ShellView = 'other'
const configs: Partial<Record<ShellView, ShellViewConfig>> = {}

export function getActiveConfig(): ShellViewConfig {
  return configs[activeView] ?? DEFAULT_CONFIG
}

export function registerShellView(
  view: ShellView,
  config: ShellViewConfig,
): () => void {
  configs[view] = config
  activeView = view
  window.dispatchEvent(new Event('dot:shell-actions-changed'))

  return () => {
    delete configs[view]
    if (activeView === view) {
      activeView = 'other'
      window.dispatchEvent(new Event('dot:shell-actions-changed'))
    }
  }
}

export function useShellView(view: ShellView, config: ShellViewConfig) {
  useEffect(() => registerShellView(view, config), [view, config])
}
