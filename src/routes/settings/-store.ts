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

export const settingsStore = new Store<SettingsState>( {
    name: '',
    image: '',
    twoFactorEnabled: false,
    backupCodes: [],
    isSavingProfile: false,
    isChangingPassword: false,
    isUpdating2FA: false,
} )

export const useSettingsStore = <T>( selector: ( state: SettingsState ) => T ) =>
    useStore( settingsStore, selector )

export const updateSettings = ( partial: Partial<SettingsState> ) => {
    settingsStore.setState( ( state ) => ( { ...state, ...partial } ) )
}
