'use server'

import { getRequest } from '@tanstack/react-start/server'

type QueueBinding = {
  send: (message: unknown) => Promise<void>
}

type RequestWithCloudflare = Request & {
  cf?: {
    env?: Env
  }
}

export function getTrashDeletionQueueFromRequestContext(): QueueBinding {
  const request = getRequest() as RequestWithCloudflare
  const queue = request.cf?.env?.TRASH_DELETION_QUEUE

  if (!queue) {
    throw new Error('Missing TRASH_DELETION_QUEUE binding.')
  }

  return queue
}
