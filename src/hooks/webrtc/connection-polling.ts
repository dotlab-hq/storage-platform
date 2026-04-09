import { handleSignal } from './connection-signals'
import type { ConnectionCallbacks, ConnectionRefs } from './connection-types'

export const SIGNAL_POLL_INTERVAL_MS = 1200

export function startSignalPolling(
  refs: ConnectionRefs,
  callbacks: ConnectionCallbacks,
) {
  if (refs.pollingRef.current) {
    return
  }

  let isPolling = false

  const poll = async () => {
    if (isPolling) {
      return
    }

    isPolling = true
    try {
      const nextSignal = await callbacks.getSignal()
      if (!nextSignal) {
        return
      }

      await handleSignal(nextSignal, refs, callbacks)
    } catch (error) {
      console.warn('Signal polling error:', error)
    } finally {
      isPolling = false
    }
  }

  void poll()
  refs.pollingRef.current = window.setInterval(() => {
    void poll()
  }, SIGNAL_POLL_INTERVAL_MS)
}
