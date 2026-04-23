import type { ActivityEventType, ActivityResourceType } from './activity'
import { logActivity } from './activity'

export interface ActivityLoggingOptions {
  resourceType?: ActivityResourceType
  resourceId?: string
  tags?: string[]
  meta?: Record<string, unknown>
}

export async function withActivityLogging<T>(
  userId: string,
  eventType: ActivityEventType,
  opts: ActivityLoggingOptions = {},
  fn: () => Promise<T>,
): Promise<T> {
  const { resourceType, resourceId, tags, meta } = opts
  try {
    const result = await fn()
    await logActivity({
      userId,
      eventType,
      resourceType,
      resourceId,
      tags,
      meta: { ...meta, success: true },
    })
    return result
  } catch (err) {
    await logActivity({
      userId,
      eventType,
      resourceType,
      resourceId,
      tags,
      meta: {
        ...meta,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
    })
    throw err
  }
}
