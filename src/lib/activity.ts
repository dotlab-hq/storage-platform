import { db } from '@/db'
import { userActivity, activityTag } from '@/db/schema/activity'
import { log } from '@/lib/logger'
import { requestContext } from '@/lib/telemetry'
import { eq } from 'drizzle-orm'
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core'

export type ActivityEventType =
  | 'file_upload'
  | 'file_download'
  | 'file_delete'
  | 'file_restore'
  | 'file_move'
  | 'file_rename'
  | 'folder_create'
  | 'folder_delete'
  | 'folder_rename'
  | 'folder_move'
  | 'login'
  | 'logout'
  | 'provider_add'
  | 'provider_update'
  | 'provider_delete'
  | 'provider_toggle'
  | 'settings_update'
  | 'password_change'
  | 'twofactor_enable'
  | 'twofactor_disable'
  | 'api_key_create'
  | 'api_key_delete'
  | 's3_request'
  | 'share_create'
  | 'share_access'
  | 'chat_message'
  | 'trash_empty'
  | 'upload_multipart'
  | 'upload_complete'
  | 'upload_abort'

export type ActivityResourceType =
  | 'file'
  | 'folder'
  | 'provider'
  | 'user'
  | 'api_key'
  | 'share'
  | 'chat'
  | 'bucket'
  | 'upload'
  | 'setting'

export interface ActivityLogInput {
  userId: string
  eventType: ActivityEventType
  resourceType?: ActivityResourceType
  resourceId?: string
  tags?: string[]
  meta?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}
export async function logActivity(input: ActivityLogInput): Promise<void> {
  const {
    userId,
    eventType,
    resourceType,
    resourceId,
    tags = [],
    meta,
    ipAddress,
    userAgent,
  } = input

  // Derive tags based on event type if not provided
  const derivedTags: string[] = [...tags]
  if (!derivedTags.includes('API') && isApiEvent(eventType)) {
    derivedTags.push('API')
  }

  try {
    // Insert activity record
    const [activity] = await db
      .insert(userActivity)
      .values({
        userId,
        eventType,
        resourceType,
        resourceId,
        metadata: meta ? JSON.stringify(meta) : '{}',
        ipAddress,
        userAgent,
      })
      .returning({ id: userActivity.id })

    // Insert tags if any
    if (derivedTags.length > 0) {
      const tagRows = derivedTags.map((tag) => ({
        activityId: activity.id,
        tag,
      }))
      await db.insert(activityTag).values(tagRows)
    }

    // Structured log to console as well (excessive logging)
    log('info', `Activity: ${eventType}`, {
      userId,
      tags: derivedTags,
      meta: {
        resourceType,
        resourceId,
        ...meta,
      },
    })
  } catch (err) {
    // Never throw - logging should never break the flow
    log('error', 'Failed to log activity', {
      userId,
      meta: { error: err instanceof Error ? err.message : String(err) },
    })
  }
}

function isApiEvent(eventType: ActivityEventType): boolean {
  // Heuristic: Any S3 request, upload, or API key usage counts as API
  return (
    eventType.includes('s3_') ||
    eventType.includes('upload') ||
    eventType === 'api_key_create' ||
    eventType === 'api_key_delete'
  )
}

// Helper to extract request context from Nitro event if available
export function getContextFromEvent(event: any): {
  userId?: string
  ipAddress?: string
  userAgent?: string
} {
  const store = requestContext.getStore()
  if (!store) return {}

  const requestId = store.get('requestId') as string | undefined
  const userId = store.get('userId') as string | undefined
  // IP and userAgent might be in event.nodeReq
  const nodeReq = event?.nodeReq
  const ipAddress =
    nodeReq?.headers.get('x-forwarded-for') ??
    nodeReq?.connection?.remoteAddress
  const userAgent = nodeReq?.headers.get('user-agent')

  return { requestId, userId, ipAddress: ipAddress as string, userAgent }
}
