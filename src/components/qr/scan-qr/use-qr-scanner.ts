import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { scanQrFn } from '@/routes/-hot-qr-server'
import { toast } from '@/components/ui/sonner'
import type { Permission } from './types'
import { useCameraScanner } from './use-camera-scanner'

const QR_LOGIN_PREFIX = 'DOT_STORAGE_QR_LOGIN:'

/** Scans a /hot login QR code and approves that device's tiny session. */
export function useQrScanner(onApproved: () => void) {
  const camera = useCameraScanner()
  const [permission, setPermission] = useState<Permission>('read')

  const parsedCode = camera.decodedText.startsWith(QR_LOGIN_PREFIX)
    ? camera.decodedText.slice(QR_LOGIN_PREFIX.length)
    : null

  const approve = useMutation({
    mutationFn: async () => {
      const response = await scanQrFn({
        data: { payload: camera.decodedText, requestedPermission: permission },
      })
      if (response.error) throw new Error(response.error)
      return response.data
    },
    onSuccess: () => {
      toast.success(
        'QR is valid. Session claim sent. Keep the /hot screen open to finish login.',
      )
      onApproved()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return { camera, parsedCode, permission, setPermission, approve }
}
