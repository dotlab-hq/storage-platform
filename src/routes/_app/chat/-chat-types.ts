export type ChatRole = 'user' | 'assistant'

export type ChatThreadSnapshot = {
  id: string
  title: string
  latestPreview: string | null
  lastMessageAt: string
  createdAt: string
  updatedAt: string
}

export type ChatMessageSnapshot = {
  id: string
  threadId: string
  role: ChatRole
  content: string
  regenerationCount: number
  createdAt: string
  updatedAt: string
}

export type PaginatedThreads = {
  items: ChatThreadSnapshot[]
  page: number
  limit: number
  hasMore: boolean
}

export type PaginatedMessages = {
  items: ChatMessageSnapshot[]
  page: number
  limit: number
  hasMore: boolean
}

export type SendChatMessageResult = {
  thread: ChatThreadSnapshot
  userMessage: ChatMessageSnapshot
  assistantMessage: ChatMessageSnapshot
}

export type ChatRouteSnapshot = {
  threads: PaginatedThreads
  activeThreadId: string | null
}
