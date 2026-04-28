export const chatQueryKeys = {
  threads: ['chat', 'threads'] as const,
  messages: (threadId: string | null) =>
    ['chat', 'messages', threadId] as const,
}
