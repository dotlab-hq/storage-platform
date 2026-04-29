import '@tanstack/react-start/server-only'
import { env } from 'cloudflare:workers'

type QueueBinding = {
  send: (message: unknown) => Promise<void>
}

export function getTrashDeletionQueueFromRequestContext(): QueueBinding {
  const queue = env.TRASH_DELETION_QUEUE

  if (!queue) {
    throw new Error('Missing TRASH_DELETION_QUEUE binding.')
  }

  return queue as unknown as QueueBinding
}
