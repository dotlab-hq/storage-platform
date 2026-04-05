export const WEBRTC_TRANSFER_PREFIX = 'DOT_STORAGE_WEBRTC:'

export function createWebrtcOfferCode() {
  const buffer = new Uint8Array(18)
  crypto.getRandomValues(buffer)
  return Array.from(buffer)
    .map((value) => value.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 28)
}

export function createWebrtcPollKey() {
  const buffer = new Uint8Array(24)
  crypto.getRandomValues(buffer)
  return Array.from(buffer)
    .map((value) => value.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 36)
}

export function buildWebrtcOfferPayload(code: string) {
  return `${WEBRTC_TRANSFER_PREFIX}${code}`
}

export function parseWebrtcOfferPayload(raw: string) {
  const value = raw.trim()
  if (!value.startsWith(WEBRTC_TRANSFER_PREFIX)) {
    return null
  }
  const code = value.slice(WEBRTC_TRANSFER_PREFIX.length)
  if (!code) {
    return null
  }
  return code
}
