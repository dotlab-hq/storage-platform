import { PROXY_MULTIPART_THRESHOLD_BYTES } from '@/lib/upload-proxy-constants'
import { getErrorMessage } from '@/lib/upload-proxy-client-shared'
import { uploadProxyMultipart } from '@/lib/upload-proxy-client-multipart'
import { uploadProxySingle } from '@/lib/upload-proxy-client-single'

export async function uploadFileViaProxy(args: {
  uploadUrl: string
  providerId: string | null
  objectKey: string
  file: File
  contentType: string
  onProgress: (progress: number) => void
}): Promise<string | null> {
  try {
    if (args.file.size >= PROXY_MULTIPART_THRESHOLD_BYTES) {
      await uploadProxyMultipart(args)
      return args.providerId
    }

    await uploadProxySingle(args)
    return args.providerId
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to upload file via proxy'))
  }
}
