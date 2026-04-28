import type { ChatThreadSnapshot } from './-chat-types'

export type ChatDialogState = {
  renameTarget: ChatThreadSnapshot | null
  deleteTarget: ChatThreadSnapshot | null
}

export const initialChatDialogState: ChatDialogState = {
  renameTarget: null,
  deleteTarget: null,
}
