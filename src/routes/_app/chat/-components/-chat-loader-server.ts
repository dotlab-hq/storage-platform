import { createServerFn } from '@tanstack/react-start'
import { listChatThreadsFn } from './-chat-thread-server'
import type { ChatRouteSnapshot } from './-chat-types'

export const getChatRouteSnapshotFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ChatRouteSnapshot> => {
    const threads = await listChatThreadsFn({ data: { page: 1, limit: 20 } })
    return {
      threads,
      activeThreadId: threads.items[0]?.id ?? null,
    }
  },
)
