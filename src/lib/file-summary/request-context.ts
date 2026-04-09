import { getRequest } from '@tanstack/react-start/server'

type WorkflowBinding = {
  create: (options: {
    id: string
    params: {
      jobId: string
      fileId: string
      userId: string
    }
  }) => Promise<{ id: string }>
}

export type FileSummaryRequestContext = {
  cloudflareEnv: Env
  executionContext: ExecutionContext
}

function readRequestContext(): FileSummaryRequestContext {
  const request = getRequest() as Request & {
    cf?: {
      env?: Env
      ctx?: ExecutionContext
    }
  }

  const cloudflareEnv = request.cf?.env
  const executionContext = request.cf?.ctx

  if (!cloudflareEnv || !executionContext) {
    throw new Error(
      'Cloudflare request context is not available for workflows.',
    )
  }

  return {
    cloudflareEnv,
    executionContext,
  }
}

export function getWorkflowBindingFromRequestContext(): WorkflowBinding {
  const context = readRequestContext()
  const envRecord = context.cloudflareEnv as unknown as Record<string, unknown>
  const binding = envRecord.FILE_SUMMARY_WORKFLOW
  if (!binding) {
    throw new Error('Missing FILE_SUMMARY_WORKFLOW workflow binding.')
  }
  return binding as WorkflowBinding
}
