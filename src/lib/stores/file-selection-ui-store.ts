import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-store'

type FileSelectionUiState = {
  hasSelectedFiles: boolean
}

const initialState: FileSelectionUiState = {
  hasSelectedFiles: false,
}

export const fileSelectionUiStore = new Store<FileSelectionUiState>(
  initialState,
)

export function setHasSelectedFiles(has: boolean) {
  fileSelectionUiStore.setState((state) => ({
    ...state,
    hasSelectedFiles: has,
  }))
}

export function useFileSelectionUiStore<T>(
  selector: (state: FileSelectionUiState) => T,
) {
  return useStore(fileSelectionUiStore, selector)
}
