import { getSignalServerFn, setSignalServerFn } from './webrtc-server'

export type SignalKind = 'offer' | 'answer' | 'ice'

export type OfferSignalPayload = {
  type: 'offer'
  sdp: RTCSessionDescriptionInit
}

export type AnswerSignalPayload = {
  type: 'answer'
  sdp: RTCSessionDescriptionInit
}

export type IceSignalPayload = {
  type: 'ice'
  candidate: RTCIceCandidateInit
}

export type SignalPayload =
  | OfferSignalPayload
  | AnswerSignalPayload
  | IceSignalPayload

type UnknownSignalRecord = {
  type?: unknown
  sdp?: unknown
  candidate?: unknown
}

function isSignalRecord(value: unknown): value is UnknownSignalRecord {
  return typeof value === 'object' && value !== null
}

function parseSignalPayload(rawSignal: unknown): SignalPayload | null {
  // Accept both string and object payloads, and try to recover from nested/double-encoded envelopes.
  let parsed: unknown = rawSignal

  if (typeof rawSignal === 'string') {
    // Try parsing once, then twice for double-encoded strings
    try {
      parsed = JSON.parse(rawSignal)
    } catch (err) {
      try {
        parsed = JSON.parse(JSON.parse(rawSignal))
      } catch (err2) {
        console.warn('Failed to JSON.parse signal payload (string):', { rawSignal, err, err2 })
        // fall through; parsed stays as raw string
      }
    }
  }

  // If parsed is still a string, attempt to parse it again (defensive)
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      // keep as string for heuristic search below
    }
  }

  // Recursive search for a candidate signal object inside arbitrary envelopes
  function findSignalCandidate(value: unknown, depth = 0): unknown | null {
    if (depth > 6 || value == null) return null

    if (typeof value === 'string') {
      // Heuristic: strings that look like JSON for a signal
      if (value.includes('"type"') || value.includes('sdp') || value.includes('candidate')) {
        try {
          const p = JSON.parse(value)
          return findSignalCandidate(p, depth + 1) ?? p
        } catch {
          // not JSON, skip
        }
      }
      return null
    }

    if (typeof value === 'object') {
      if (isSignalRecord(value) && typeof (value as any).type === 'string') {
        return value
      }

      // Common envelope patterns: look into arrays and object fields
      if (Array.isArray(value)) {
        for (const item of value) {
          const found = findSignalCandidate(item, depth + 1)
          if (found) return found
        }
      } else {
        for (const key of Object.keys(value as Record<string, unknown>)) {
          const child = (value as Record<string, unknown>)[key]
          const found = findSignalCandidate(child, depth + 1)
          if (found) return found
        }
      }
    }
    return null
  }
  const candidate = findSignalCandidate(parsed)
  if (!candidate) {
    console.warn('No signal-like object found in payload:', parsed)
    return null
  }
  if (!isSignalRecord(candidate) || typeof (candidate as any).type !== 'string') {
    console.warn('Found candidate but it is not a valid signal record:', candidate)
    return null
  }
  const sig = candidate as any
  if (sig.type === 'offer' || sig.type === 'answer') {
    // Accept sdp either as object or as JSON string with 'sdp' field
    let sdpObj: unknown = sig.sdp
    if (typeof sdpObj === 'string') {
      try {
        sdpObj = JSON.parse(sdpObj)
      } catch {
        // if it is a plain SDP string, wrap into RTCSessionDescriptionInit-like object
        sdpObj = { type: sig.type, sdp: sdpObj }
      }
    }
    if (!sdpObj || typeof sdpObj !== 'object' || typeof (sdpObj as any).sdp !== 'string') {
      console.warn('Unexpected SDP payload structure:', sdpObj)
      return null
    }
    return {
      type: sig.type,
      sdp: sdpObj as RTCSessionDescriptionInit,
    }
  }
  if (sig.type === 'ice') {
    let candidateObj: unknown = sig.candidate
    if (typeof candidateObj === 'string') {
      try {
        candidateObj = JSON.parse(candidateObj)
      } catch {
        // Leave as string; addIceCandidate accepts RTCIceCandidateInit with candidate string field
        candidateObj = { candidate: candidateObj }
      }
    }
    if (!candidateObj || typeof candidateObj !== 'object') {
      console.warn('Unexpected ICE payload structure:', candidateObj)
      return null
    }
    return {
      type: 'ice',
      candidate: candidateObj as RTCIceCandidateInit,
    }
  }
  return null
}

export function createSignalChannel(sessionTokenRef: {
  current: string | null
}) {
  let sendQueue = Promise.resolve()

  const sendSignal = async (payload: SignalPayload) => {
    const token = sessionTokenRef.current
    if (!token) {
      return
    }

    const task = async () => {
      await setSignalServerFn({
        data: {
          sessionToken: token,
          signal: JSON.stringify(payload),
        },
      })
    }

    sendQueue = sendQueue.then(task).catch((error) => {
      console.warn('Failed to send WebRTC signal:', error)
    })

    await sendQueue
  }

  const getSignal = async (): Promise<SignalPayload | null> => {
    const token = sessionTokenRef.current
    if (!token) {
      return null
    }

    const response = await getSignalServerFn({ data: { sessionToken: token } })
    if (!response.hasSignal || !response.signal) {
      // Helpful debug output when polling indicates a signal but the payload is empty/falsy
      console.warn('No signal available or empty signal payload from server:', response)
      return null
    }

    const parsed = parseSignalPayload(response.signal)
    if (!parsed) {
      console.warn('Failed to parse signal payload; raw:', response.signal)
    }
    return parsed
  }

  return { sendSignal, getSignal }
}
