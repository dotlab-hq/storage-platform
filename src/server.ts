import handler from '@tanstack/react-start/server-entry'
export { UrlImportWorkflow } from '@/lib/url-import/workflow'

type QueueConsumerEnv = {
  KV: KVNamespace
  URL_IMPORT_WORKFLOW: {
    create: (input: { id?: string; params: unknown }) => Promise<{ id: string }>
  }
}

export default {
  fetch: handler.fetch,
  async queue(
    batch: MessageBatch<unknown>,
    env: QueueConsumerEnv,
    _ctx: ExecutionContext,
  ): Promise<void> {
    const { consumeUrlImportQueue } =
      await import('@/lib/url-import/queue-consumer')
    await consumeUrlImportQueue(batch, env)
  },
  async scheduled(
    event: ScheduledController,
    _env: QueueConsumerEnv,
    _ctx: ExecutionContext,
  ): Promise<void> {
    console.log('Cron triggered:', event.cron)
  },
}
