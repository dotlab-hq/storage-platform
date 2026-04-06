import { WorkflowEntrypoint, WorkflowStep } from 'cloudflare:workers'
import type { WorkflowEvent } from 'cloudflare:workers'
import type { UrlImportQueueMessage } from '@/lib/url-import/types'

type UrlImportWorkflowResult = {
  fileId: string
  objectKey: string
  fileName: string
}

type UrlImportWorkflowEnv = {
  KV: KVNamespace
}

export class UrlImportWorkflow extends WorkflowEntrypoint<
  UrlImportWorkflowEnv,
  UrlImportQueueMessage
> {
  async run(
    event: WorkflowEvent<UrlImportQueueMessage>,
    step: WorkflowStep,
  ): Promise<UrlImportWorkflowResult> {
    const payload = event.payload

    const helpers = await import('@/lib/url-import/workflow-helpers')
    const ensureRunning = async () => {
      await helpers.markStatus({
        kv: this.env.KV,
        payload,
        status: 'running',
        error: null,
      })
      return true
    }

    try {
      await step.do('mark-running', ensureRunning)

      const fetched = await step.do(
        'download-upstream-content',
        {
          retries: {
            limit: 10,
            delay: '10 seconds',
            backoff: 'exponential',
          },
          timeout: '5 minutes',
        },
        async () => {
          const headers = new Headers()
          for (const pair of payload.headers) {
            headers.set(pair.key, pair.value)
          }

          const cookieHeader = helpers.buildCookieHeader(payload.cookies)
          if (cookieHeader) {
            headers.set('cookie', cookieHeader)
          }

          const response = await fetch(payload.url, {
            method: payload.method,
            headers,
            redirect: 'follow',
          })

          if (!response.ok) {
            throw new Error(
              `Upstream request failed with status ${response.status}`,
            )
          }

          const contentType = response.headers.get('content-type')
          const arrayBuffer = await response.arrayBuffer()
          if (arrayBuffer.byteLength === 0) {
            throw new Error('Upstream response body is empty')
          }

          return {
            content: Array.from(new Uint8Array(arrayBuffer)),
            contentType,
            size: arrayBuffer.byteLength,
            finalUrl: response.url,
          }
        },
      )

      const uploaded = await step.do(
        'upload-direct-to-provider',
        {
          retries: {
            limit: 10,
            delay: '10 seconds',
            backoff: 'exponential',
          },
          timeout: '5 minutes',
        },
        async () => {
          const uploadDirect = await import('@/lib/url-import/upload-direct')
          const fileBytes = new Uint8Array(fetched.content)
          const contentType = fetched.contentType ?? 'application/octet-stream'
          const fileName = helpers.inferFileName(
            fetched.finalUrl,
            payload.savePath,
            contentType,
          )
          const objectKey = `${payload.userId}/${crypto.randomUUID()}-${fileName.replace(/\s+/g, '_')}`

          const providerUpload =
            await uploadDirect.uploadToProviderWithMultipart({
              objectKey,
              contentType,
              content: fileBytes,
            })

          const uploadServer = await import('@/lib/upload-server')
          const registered = await uploadServer.registerFile({
            data: {
              fileName,
              objectKey,
              mimeType: contentType,
              fileSize: fetched.size,
              parentFolderId: payload.parentFolderId,
              providerId: providerUpload.providerId,
            },
          })

          if (!registered.file) {
            throw new Error('Could not register imported file')
          }

          const cacheInvalidation = await import('@/lib/cache-invalidation')
          await cacheInvalidation.invalidateFolderCache(
            payload.userId,
            payload.parentFolderId,
          )
          await cacheInvalidation.invalidateQuotaCache(payload.userId)

          return {
            fileId: registered.file.id,
            objectKey,
            fileName,
          }
        },
      )

      await step.do('mark-completed', async () => {
        await helpers.markStatus({
          kv: this.env.KV,
          payload,
          status: 'completed',
          error: null,
        })
        return true
      })

      return uploaded
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : 'Workflow failed unexpectedly'
      await helpers.markStatus({
        kv: this.env.KV,
        payload,
        status: 'failed',
        error: errorText,
      })
      throw error
    }
  }
}
