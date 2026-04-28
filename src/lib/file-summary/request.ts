import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth.server'
import { getSummaryTarget } from './target'
import { createSourceProfile } from './source'
import { getFileSummaryLimits, getFileSummaryModelName } from './config'
import { createSummaryJob, getActiveSummaryJob } from './jobs'
import { triggerFileSummaryWorkflow } from './workflow-start'

const RequestSummarySchema = z.object({
  fileId: z.string().min(1),
})

export const requestFileSummaryFn = createServerFn({ method: 'POST' })
  .inputValidator(RequestSummarySchema)
  .handler(async ({ data }) => {
    const currentUser = await getAuthenticatedUser()

    const existingActive = await getActiveSummaryJob(
      data.fileId,
      currentUser.id,
    )
    if (existingActive) {
      return {
        job: existingActive,
        queued: false,
      }
    }

    const target = await getSummaryTarget(data.fileId, currentUser.id)
    const limits = getFileSummaryLimits()
    const sourceProfile = createSourceProfile(target, limits.largeFileBytes)

    const metadata = {
      fileName: target.name,
      extension: sourceProfile.extension,
      mimeType: target.mimeType,
      sizeInBytes: target.sizeInBytes,
      providerName: target.providerName,
      bucketName: target.bucketName,
      waves: sourceProfile.waves,
      bytesReadForSummary: 0,
      textWasTruncated: false,
      modelInputChars: 0,
      maxInputChars: limits.maxInputChars,
    }

    const createdJob = await createSummaryJob({
      fileId: target.fileId,
      userId: target.userId,
      model: getFileSummaryModelName(),
      sourceType: sourceProfile.sourceType,
      isLargeFile: sourceProfile.isLargeFile,
      metadata,
    })

    await triggerFileSummaryWorkflow({
      jobId: createdJob.id,
      fileId: target.fileId,
      userId: target.userId,
    })

    return {
      job: {
        ...createdJob,
        status: 'processing' as const,
        startedAt: new Date().toISOString(),
      },
      queued: true,
    }
  })
