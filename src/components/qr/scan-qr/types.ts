export type Permission = 'read' | 'read-write'

export type Html5QrScanner = {
  start: (
    cameraIdOrConfig: string | MediaTrackConstraints,
    configuration?: {
      fps?: number
      qrbox?: { width: number; height: number }
    },
    qrCodeSuccessCallback?: (decodedText: string) => void,
    qrCodeErrorCallback?: (errorMessage: string) => void,
  ) => Promise<unknown>
  stop: () => Promise<void>
  clear: () => void
}

export type ScanState = 'idle' | 'scanning' | 'review' | 'submitting'
