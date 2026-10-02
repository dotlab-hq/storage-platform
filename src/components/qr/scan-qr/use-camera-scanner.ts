import { useEffect, useId, useState } from 'react'
import type { Html5QrScanner } from './types'
import { startScannerWithFallback } from './utils'

async function stopScanner(scanner: Html5QrScanner | null) {
  if (!scanner) return
  try {
    await scanner.stop()
  } catch {
    // The camera may not have started yet.
  }
  try {
    scanner.clear()
  } catch {
    // Already cleared.
  }
}

/**
 * Runs the camera QR scanner while the calling component is mounted and no
 * code has been decoded yet. Render `<div id={regionId} />` while
 * `decodedText` is empty; the camera stops as soon as a code is read.
 * Mount it inside dialog content so closing the dialog resets everything.
 */
export function useCameraScanner() {
  const regionId = useId().replace(/:/g, '')
  const [decodedText, setDecodedText] = useState('')
  const [cameraError, setCameraError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (decodedText) return
    let cancelled = false
    let scanner: Html5QrScanner | null = null

    const start = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelled) return
        scanner = new Html5Qrcode(regionId) as unknown as Html5QrScanner
        await startScannerWithFallback(scanner, (text) => {
          if (!cancelled) setDecodedText(text)
        })
        // Unmounted while the camera was starting: stop it now.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- set by the cleanup while awaiting
        if (cancelled) void stopScanner(scanner)
      } catch (error) {
        if (cancelled) return
        setCameraError(
          error instanceof Error ? error.message : 'Unable to start camera.',
        )
      }
    }

    void start()
    return () => {
      cancelled = true
      void stopScanner(scanner)
    }
  }, [regionId, decodedText, attempt])

  /** Discards the decoded code (or camera error) and starts the camera again. */
  const rescan = () => {
    setDecodedText('')
    setCameraError('')
    setAttempt((count) => count + 1)
  }

  return { regionId, decodedText, cameraError, rescan }
}
