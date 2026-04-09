import { and, desc, eq } from 'drizzle-orm'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/db'
import { fileSummaryJob } from '@/db/schema/file-summary'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { toSummaryJobSnapshot } from './serialization'

const GetLatestSummarySchema = z.object({
  fileId: z.string().min(1),
})

export const getLatestFileSummaryFn = createServerFn({ method: 'GET' })
  .inputValidator(GetLatestSummarySchema)
  .handler(async ({ data }) => {
    const currentUser = await getAuthenticatedUser()

    const [row] = await db
      .select({
        id: fileSummaryJob.id,
        fileId: fileSummaryJob.fileId,
        userId: fileSummaryJob.userId,
        model: fileSummaryJob.model,
        status: fileSummaryJob.status,
        sourceType: fileSummaryJob.sourceType,
        isLargeFile: fileSummaryJob.isLargeFile,
        attempts: fileSummaryJob.attempts,
        summaryText: fileSummaryJob.summaryText,
        metadataJson: fileSummaryJob.metadataJson,
        failureReason: fileSummaryJob.failureReason,
        startedAt: fileSummaryJob.startedAt,
        completedAt: fileSummaryJob.completedAt,
        createdAt: fileSummaryJob.createdAt,
        updatedAt: fileSummaryJob.updatedAt,
      })
      .from(fileSummaryJob)
      .where(
        and(
          eq(fileSummaryJob.fileId, data.fileId),
          eq(fileSummaryJob.userId, currentUser.id),
        ),
      )
      .orderBy(desc(fileSummaryJob.createdAt))
      .limit(1)

    return { summary: row ? toSummaryJobSnapshot(row) : null }
  })
