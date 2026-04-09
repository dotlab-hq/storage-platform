import type { ConnectionCallbacks, ConnectionRefs } from './connection-types'
import type { SignalPayload } from './signal-channel'

async function applyQueuedCandidates(refs: ConnectionRefs) {
  const connection = refs.peerConnectionRef.current
  if (!connection || !connection.remoteDescription) {
    return
  }

  while (refs.queueRef.current.length > 0) {
    const candidate = refs.queueRef.current.shift()
    if (!candidate) {
      continue
    }
    try {
      await connection.addIceCandidate(candidate)
    } catch (error) {
      console.warn('Failed to apply queued ICE candidate:', error)
    }
  }
}

export async function handleSignal(
  signal: SignalPayload,
  refs: ConnectionRefs,
  callbacks: ConnectionCallbacks,
) {
  const connection = refs.peerConnectionRef.current
  if (!connection) {
    return
  }

  if (signal.type === 'offer') {
    if (!connection.remoteDescription) {
      await connection.setRemoteDescription(signal.sdp)
      await applyQueuedCandidates(refs)
    }

    if (!connection.localDescription) {
      const answer = await connection.createAnswer()
      await connection.setLocalDescription(answer)
      await callbacks.sendSignal({ type: 'answer', sdp: answer })
    }
    return
  }

  if (signal.type === 'answer') {
    if (!connection.localDescription || connection.remoteDescription) {
      return
    }
    await connection.setRemoteDescription(signal.sdp)
    await applyQueuedCandidates(refs)
    return
  }

  if (!connection.remoteDescription) {
    refs.queueRef.current.push(signal.candidate)
    return
  }

  try {
    await connection.addIceCandidate(signal.candidate)
  } catch (error) {
    console.warn('Failed to add ICE candidate:', error)
  }
}
