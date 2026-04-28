import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-store'

interface SettingsState {
  name: string
  image: string
  twoFactorEnabled: boolean
  backupCodes: string[]
  isSavingProfile: boolean
  isChangingPassword: boolean
  isUpdating2FA: boolean
}

const initialState: SettingsState = {
  name: '',
  image: '',
  twoFactorEnabled: false,
  backupCodes: [],
  isSavingProfile: false,
  isChangingPassword: false,
  isUpdating2FA: false,
}

export const settingsStore = new Store<SettingsState>(initialState)

export const useSettingsStore = <T>(selector: (state: SettingsState) => T) =>
  useStore(settingsStore, selector)

export const updateSettings = (partial: Partial<SettingsState>) => {
  if (typeof settingsStore.setState !== 'function') {
    console.error(
      'ERROR: settingsStore.setState is not a function!',
      'typeof setState:',
      typeof settingsStore.setState,
    )
    return
  }
  settingsStore.setState((state: SettingsState) => ({ ...state, ...partial }))
}
