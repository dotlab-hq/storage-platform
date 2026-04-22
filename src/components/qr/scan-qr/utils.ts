import type { Html5QrScanner } from './types'

export const SCAN_QR_INTRO_SEEN_KEY = 'dot_storage_scan_qr_intro_seen_v1'

export async function startScannerWithFallback(
  scanner: Html5QrScanner,
  onSuccess: (decodedText: string) => void,
) {
  const config = { fps: 10, qrbox: { width: 220, height: 220 } }
  const onError = () => {
    // Ignore frame decode misses.
  }

  try {
    await scanner.start(
      { facingMode: { exact: 'environment' } },
      config,
      onSuccess,
      onError,
    )
    return
  } catch {
    // fallback
  }

  try {
    await scanner.start({ facingMode: 'user' }, config, onSuccess, onError)
    return
  } catch {
    // fallback
  }

  const { Html5Qrcode } = await import('html5-qrcode')
  const cameras = await Html5Qrcode.getCameras()
  if (cameras.length === 0) {
    throw new Error('No camera detected.')
  }
  await scanner.start(cameras[0].id, config, onSuccess, onError)
}
