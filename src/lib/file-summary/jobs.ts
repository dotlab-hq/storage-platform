import { and, desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { fileSummaryEvent, fileSummaryJob } from '@/db/schema/file-summary'
import { stringifySummaryMetadata, toSummaryJobSnapshot } from './serialization'
import type {
  FileSummaryJobSnapshot,
  FileSummaryJobStatus,
  FileSummaryMetadata,
  GeneratedSummary,
} from './types'

const ACTIVE_JOB_STATUSES: FileSummaryJobStatus[] = ['queued', 'processing']

const FILE_SUMMARY_JOB_SELECT = {
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
}

export async function getActiveSummaryJob(
  fileId: string,
  userId: string,
): Promise<FileSummaryJobSnapshot | null> {
  const [row] = await db
    .select(FILE_SUMMARY_JOB_SELECT)
    .from(fileSummaryJob)
    .where(
      and(
        eq(fileSummaryJob.fileId, fileId),
        eq(fileSummaryJob.userId, userId),
        inArray(fileSummaryJob.status, ACTIVE_JOB_STATUSES),
      ),
    )
    .orderBy(desc(fileSummaryJob.createdAt))
    .limit(1)

  return row ? toSummaryJobSnapshot(row) : null
}

export async function createSummaryJob(input: {
  fileId: string
  userId: string
  model: string
  isLargeFile: boolean
  sourceType: FileSummaryJobSnapshot['sourceType']
  metadata: FileSummaryMetadata
}): Promise<FileSummaryJobSnapshot> {
  const jobId = crypto.randomUUID()

  const [row] = await db
    .insert(fileSummaryJob)
    .values({
      id: jobId,
      fileId: input.fileId,
      userId: input.userId,
      model: input.model,
      status: 'queued',
      sourceType: input.sourceType,
      isLargeFile: input.isLargeFile,
      attempts: 0,
      metadataJson: stringifySummaryMetadata(input.metadata),
      summaryText: null,
      failureReason: null,
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning(FILE_SUMMARY_JOB_SELECT)

  if (!row) {
    throw new Error('Failed to create summary job.')
  }

  await appendSummaryEvent(jobId, 'queued', 'Summary job created.', {
    sourceType: input.sourceType,
    isLargeFile: input.isLargeFile,
  })

  return toSummaryJobSnapshot(row)
}

export async function appendSummaryEvent(
  jobId: string,
  status: FileSummaryJobStatus,
  message: string,
  detail: Record<string, string | number | boolean | null>,
): Promise<void> {
  await db.insert(fileSummaryEvent).values({
    id: crypto.randomUUID(),
    jobId,
    status,
    message,
    detailJson: JSON.stringify(detail),
    createdAt: new Date(),
  })
}

export async function markSummaryJobProcessing(jobId: string): Promise<void> {
  await db
    .update(fileSummaryJob)
    .set({
      status: 'processing',
      startedAt: new Date(),
      failureReason: null,
      updatedAt: new Date(),
    })
    .where(eq(fileSummaryJob.id, jobId))
}

export async function markSummaryJobAttempt(
  jobId: string,
  attempt: number,
): Promise<void> {
  await db
    .update(fileSummaryJob)
    .set({ attempts: attempt, status: 'processing', updatedAt: new Date() })
    .where(eq(fileSummaryJob.id, jobId))

  await appendSummaryEvent(jobId, 'processing', 'Summary generation attempt.', {
    attempt,
  })
}

export async function markSummaryJobCompleted(
  jobId: string,
  summary: GeneratedSummary,
  attempts: number,
): Promise<void> {
  await db
    .update(fileSummaryJob)
    .set({
      status: 'completed',
      attempts,
      sourceType: summary.sourceType,
      isLargeFile: summary.isLargeFile,
      summaryText: summary.summaryText,
      metadataJson: stringifySummaryMetadata(summary.metadata),
      failureReason: null,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(fileSummaryJob.id, jobId))

  await appendSummaryEvent(
    jobId,
    'completed',
    'Summary generation completed.',
    {
      attempts,
      sourceType: summary.sourceType,
    },
  )
}

export async function markSummaryJobFailed(
  jobId: string,
  reason: string,
  attempts: number,
): Promise<void> {
  await db
    .update(fileSummaryJob)
    .set({
      status: 'failed',
      attempts,
      failureReason: reason,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(fileSummaryJob.id, jobId))

  await appendSummaryEvent(jobId, 'failed', 'Summary generation failed.', {
    attempts,
    reason,
  })
}
