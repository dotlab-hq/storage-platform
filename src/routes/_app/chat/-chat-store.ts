import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-store'

type ChatUiState = {
  activeThreadId: string | null
  isComposingNewThread: boolean
  searchQuery: string
  composerValue: string
  threadPanelOpen: boolean
  sheetOpen: boolean
  renameTargetId: string | null
  deleteTargetId: string | null
}

const initialChatUiState: ChatUiState = {
  activeThreadId: null,
  isComposingNewThread: false,
  searchQuery: '',
  composerValue: '',
  threadPanelOpen: true,
  sheetOpen: false,
  renameTargetId: null,
  deleteTargetId: null,
}

export const chatUiStore = new Store<ChatUiState>( initialChatUiState )

export const useChatUiStore = <T>( selector: ( state: ChatUiState ) => T ) =>
  useStore( chatUiStore, selector )

export function updateChatUi( partial: Partial<ChatUiState> ) {
  chatUiStore.setState( ( state ) => ( { ...state, ...partial } ) )
}

export function resetChatUi() {
  chatUiStore.setState( () => initialChatUiState )
}
