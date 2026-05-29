import type { AdminProviderContentsResponse } from '@/lib/admin-provider-browser'
import {
  getAdminProviderContentsFn,
  getAdminProviderObjectUrlFn,
} from '@/routes/_app/admin/-provider-contents-server'
import {
  getUserProviderContentsFn,
  getUserProviderObjectUrlFn,
} from '@/routes/_app/settings/-provider-contents-server'

export type LoadProviderContentsArgs = {
  providerId: string
  prefix: string
  continuationToken?: string | null
  scope: 'admin' | 'user'
  searchQuery?: string
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof (error as { data?: { message?: unknown } }).data?.message ===
      'string'
  ) {
    return (error as { data: { message: string } }).data.message
  }
  return 'Failed to load provider contents'
}

export async function loadProviderContents({
  providerId,
  prefix,
  continuationToken,
  scope,
  searchQuery = '',
}: LoadProviderContentsArgs): Promise<AdminProviderContentsResponse> {
  try {
    const data = {
      providerId,
      prefix,
      continuationToken: continuationToken ?? null,
      maxKeys: 250,
      search: searchQuery.length > 0 ? searchQuery : undefined,
    }
    return scope === 'user'
      ? await getUserProviderContentsFn({ data })
      : await getAdminProviderContentsFn({ data })
  } catch (error) {
    throw new Error(toErrorMessage(error))
  }
}

export async function getProviderObjectUrl(input: {
  providerId: string
  objectKey: string
  scope: 'admin' | 'user'
}): Promise<string> {
  const data = {
    providerId: input.providerId,
    objectKey: input.objectKey,
  }
  const result =
    input.scope === 'user'
      ? await getUserProviderObjectUrlFn({ data })
      : await getAdminProviderObjectUrlFn({ data })
  return result.url
}
