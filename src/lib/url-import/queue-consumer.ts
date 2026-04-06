import type { UrlImportQueueMessage } from '@/lib/url-import/types'
import { UrlImportQueueMessageSchema } from '@/lib/url-import/types'
import { markStatus } from '@/lib/url-import/workflow-helpers'

type UrlImportWorkflowBinding = {
  create: (input: {
    id?: string
    params: UrlImportQueueMessage
  }) => Promise<{ id: string }>
}

type UrlImportConsumerEnv = {
  KV: KVNamespace
  URL_IMPORT_WORKFLOW: UrlImportWorkflowBinding
}

type QueueMessageWithAck = {
  body: unknown
  ack: () => void
  retry: () => void
}

type QueueBatchLike = {
  messages: readonly QueueMessageWithAck[]
}

export async function consumeUrlImportQueue(
  batch: QueueBatchLike,
  env: UrlImportConsumerEnv,
): Promise<void> {
  for (const message of batch.messages) {
    try {
      const parsed = UrlImportQueueMessageSchema.parse(message.body)
      await env.URL_IMPORT_WORKFLOW.create({
        id: parsed.jobId,
        params: parsed,
      })
      message.ack()
    } catch (error) {
      const maybeBody = message.body
      const decodeResult = UrlImportQueueMessageSchema.safeParse(maybeBody)
      if (decodeResult.success) {
        const errorText =
          error instanceof Error ? error.message : 'Unknown error'
        await markStatus({
          kv: env.KV,
          payload: decodeResult.data,
          status: 'failed',
          error: `Queue consumer failed: ${errorText}`,
        })
        message.retry()
      } else {
        message.ack()
      }
    }
  }
}
