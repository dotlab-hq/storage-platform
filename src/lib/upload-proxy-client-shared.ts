import {
  PROXY_MAX_PARTS,
  PROXY_MIN_PART_SIZE_BYTES,
  PROXY_TARGET_PART_COUNT,
} from '@/lib/upload-proxy-constants'

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export async function readErrorBody(response: Response): Promise<string> {
  const body = await response.text()
  return body.length > 0 ? body : 'Unknown upload error'
}

export function computePartSize(fileSize: number): number {
  return Math.max(
    PROXY_MIN_PART_SIZE_BYTES,
    Math.ceil(fileSize / PROXY_TARGET_PART_COUNT),
    Math.ceil(fileSize / PROXY_MAX_PARTS),
  )
}
