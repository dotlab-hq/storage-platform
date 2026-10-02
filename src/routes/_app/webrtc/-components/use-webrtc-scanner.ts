import { useMutation } from '@tanstack/react-query'
import { useWebRTC } from '@/hooks/use-webrtc'
import { scanWebrtcOfferFn } from './webrtc-rpc'

/**
 * The answering side of a WebRTC transfer: claims a scanned offer and starts
 * the peer connection with the session token it returns.
 */
export function useWebrtcScanner() {
  const { startConnection } = useWebRTC()

  return useMutation({
    mutationFn: async (payload: string) => {
      const result = await scanWebrtcOfferFn({ data: { payload } })
      if (!result.sessionToken) throw new Error(result.message)
      return result.sessionToken
    },
    onSuccess: (sessionToken) => startConnection(sessionToken, 'answerer'),
  })
}
