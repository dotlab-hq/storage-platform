import { db } from '@/db'
import {
  getAuthenticatedUser,
  requireAdminUser,
} from '@/lib/server-auth.server'
import { logActivity } from '@/lib/activity'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ServiceContext = {
  userId: string
  isAdmin: boolean
  requestId?: string
}

export type ServiceResult<T = any> = {
  data?: T
  error?: {
    message: string
    code?: string
    details?: any
  }
}

export class BaseService {
  protected ctx: ServiceContext
  protected db = db

  constructor(ctx: ServiceContext) {
    this.ctx = ctx
  }

  // Auth helpers
  protected assertAuthenticated(): asserts this is {
    ctx: ServiceContext & { userId: string }
  } {
    if (!this.ctx.userId) {
      throw new Error('Unauthorized')
    }
  }

  protected assertAdmin(): asserts this is {
    ctx: ServiceContext & { isAdmin: true }
  } {
    if (!this.ctx.isAdmin) {
      throw new Error('Forbidden: admin access required')
    }
  }

  // DB helpers
  protected async transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return this.db.transaction(fn)
  }

  // Activity logging
  protected async logActivity(
    eventType: string,
    resourceType?: string,
    resourceId?: string,
    meta?: Record<string, unknown>,
  ) {
    try {
      await logActivity({
        userId: this.ctx.userId,
        eventType: eventType as any,
        resourceType: resourceType as any,
        resourceId,
        meta,
      })
    } catch (err) {
      // Non-blocking: swallow activity log errors to avoid breaking main flow
      console.warn('Activity log failed:', err)
    }
  }

  // Standardized error factory
  protected error(message: string, code?: string, details?: any): never {
    throw new Error(message)
  }

  // Standardized success factory
  protected success<T>(data: T): ServiceResult<T> {
    return { data }
  }
}

// Factory for creating service instances from serverFn context
export async function createServiceContext(): Promise<ServiceContext> {
  const user = await getAuthenticatedUser().catch(() => null)
  return {
    userId: user?.id || '',
    isAdmin: user?.role === 'admin',
    requestId: crypto.randomUUID(),
  }
}

export async function createAdminServiceContext(): Promise<ServiceContext> {
  const user = await requireAdminUser()
  return {
    userId: user.id,
    isAdmin: true,
    requestId: crypto.randomUUID(),
  }
}
