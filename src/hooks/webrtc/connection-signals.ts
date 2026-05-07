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
    console.warn('No peer connection established')
    return
  }

  if (signal.type === 'offer') {
    try {
      if (!connection.remoteDescription) {
        console.log('Setting remote description from offer')
        await connection.setRemoteDescription(signal.sdp)
        await applyQueuedCandidates(refs)
      }

      if (!connection.localDescription) {
        console.log('Creating and sending answer')
        const answer = await connection.createAnswer()
        await connection.setLocalDescription(answer)
        await callbacks.sendSignal({ type: 'answer', sdp: answer })
        console.log('Answer sent successfully')
      }
    } catch (error) {
      console.error('Error handling offer:', error)
    }
    return
  }

  if (signal.type === 'answer') {
    try {
      if (!connection.localDescription) {
        console.warn('Ignoring answer - no local description set yet')
        return
      }
      if (connection.remoteDescription) {
        console.warn('Ignoring answer - remote description already set')
        return
      }
      console.log('Setting remote description from answer')
      await connection.setRemoteDescription(signal.sdp)
      await applyQueuedCandidates(refs)
      console.log('Answer processed successfully')
    } catch (error) {
      console.error('Error handling answer:', error)
    }
    return
  }

  if (signal.type === 'ice') {
    if (!connection.remoteDescription) {
      console.log('Queueing ICE candidate (remote description not ready)')
      refs.queueRef.current.push(signal.candidate)
      return
    }

    try {
      await connection.addIceCandidate(signal.candidate)
    } catch (error) {
      console.warn('Failed to add ICE candidate:', error)
    }
  }
}
