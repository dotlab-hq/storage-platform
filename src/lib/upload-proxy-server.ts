import {
  handleCompleteUpload,
  handleInitiateUpload,
  handleUploadPart,
} from '@/lib/upload-proxy-multipart'
import { handleSingleUpload } from '@/lib/upload-proxy-single'
import { parseMultipartAction } from '@/lib/upload-proxy-utils'

export async function handleProxyUploadRequest(
  request: Request,
  userId: string,
) {
  const action = parseMultipartAction(request)
  if (action === 'initiate') return handleInitiateUpload(request, userId)
  if (action === 'part') return handleUploadPart(request)
  if (action === 'complete') return handleCompleteUpload(request)
  return handleSingleUpload(request, userId)
}
