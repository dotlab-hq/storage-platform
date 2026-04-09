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

function parseSignalPayload(rawSignal: string): SignalPayload | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawSignal)
  } catch {
    return null
  }

  if (!isSignalRecord(parsed) || typeof parsed.type !== 'string') {
    return null
  }

  if (parsed.type === 'offer' || parsed.type === 'answer') {
    if (!parsed.sdp || typeof parsed.sdp !== 'object') {
      return null
    }
    return {
      type: parsed.type,
      sdp: parsed.sdp as RTCSessionDescriptionInit,
    }
  }

  if (parsed.type === 'ice') {
    if (!parsed.candidate || typeof parsed.candidate !== 'object') {
      return null
    }
    return {
      type: 'ice',
      candidate: parsed.candidate as RTCIceCandidateInit,
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
      return null
    }

    return parseSignalPayload(response.signal)
  }

  return { sendSignal, getSignal }
}
