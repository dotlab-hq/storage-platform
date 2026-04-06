import { scanQrFn } from '@/routes/-hot-qr-server'
import { useMutation } from '@tanstack/react-query'
import * as React from 'react'
import { toast } from '@/components/ui/sonner'
import type { Permission, ScanState, Html5QrScanner } from './types'
import { startScannerWithFallback } from './utils'

export function useQrScanner(open: boolean, setOpen: (open: boolean) => void) {
  const [state, setState] = React.useState<ScanState>('idle')
  const [permission, setPermission] = React.useState<Permission>('read')
  const [decodedPayload, setDecodedPayload] = React.useState<string>('')
  const [cameraError, setCameraError] = React.useState<string>('')
  const scannerRef = React.useRef<{
    stop: () => Promise<void>
    clear: () => void
  } | null>(null)

  // Create a clean region ID to avoid issues with hydration/colons
  const regionId = React.useId().replace(/:/g, '')

  const stopScanner = React.useCallback(async () => {
    const scanner = scannerRef.current
    if (!scanner) return
    try {
      await scanner.stop()
    } catch {
      // no-op
    }
    try {
      scanner.clear()
    } catch {
      // no-op
    }
    scannerRef.current = null
  }, [])

  const reset = React.useCallback(async () => {
    await stopScanner()
    setDecodedPayload('')
    setCameraError('')
    setPermission('read')
    setState('idle')
  }, [stopScanner])

  React.useEffect(() => {
    if (!open) {
      void reset()
      return
    }

    let cancelled = false
    const start = async () => {
      try {
        setState('scanning')
        setCameraError('')
        const { Html5Qrcode } = await import('html5-qrcode')
        const scanner = new Html5Qrcode(regionId) as unknown as Html5QrScanner
        scannerRef.current = scanner
        await startScannerWithFallback(scanner, (text) => {
          if (cancelled) return
          setDecodedPayload(text)
          setState('review')
          void stopScanner()
        })
      } catch (error) {
        if (cancelled) return
        setState('idle')
        setCameraError(
          error instanceof Error ? error.message : 'Unable to start camera.',
        )
      }
    }

    void start()
    return () => {
      cancelled = true
      void stopScanner()
    }
  }, [open, regionId, reset, stopScanner])

  const handleInvalidQr = async () => {
    setDecodedPayload('')
    setState('scanning')
    setCameraError('')
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode(regionId) as unknown as Html5QrScanner
      scannerRef.current = scanner
      await startScannerWithFallback(scanner, (text) => {
        setDecodedPayload(text)
        setState('review')
        void stopScanner()
      })
    } catch (error) {
      setState('idle')
      setCameraError(
        error instanceof Error ? error.message : 'Unable to restart camera.',
      )
    }
  }

  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await scanQrFn({
        data: { payload: decodedPayload, requestedPermission: permission },
      })
      if (response.error) throw new Error(response.error)
      return response.data
    },
    onMutate: () => setState('submitting'),
    onSuccess: () => {
      toast.success(
        'QR is valid. Session claim sent. Keep the /hot screen open to finish login.',
      )
      setOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
      setState('review')
    },
  })
  const submitScan = () => {
    if (!decodedPayload) {
      toast.error('No QR payload scanned yet.')
      return
    }
    submitMutation.mutate()
  }

  const parsedCode = React.useMemo(() => {
    const prefix = 'DOT_STORAGE_QR_LOGIN:'
    if (!decodedPayload.startsWith(prefix)) return null
    return decodedPayload.slice(prefix.length)
  }, [decodedPayload])

  return {
    state,
    permission,
    setPermission,
    decodedPayload,
    cameraError,
    regionId,
    handleInvalidQr,
    submitScan,
    parsedCode,
    reset,
  }
}
