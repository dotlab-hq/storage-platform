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
  let consecutiveErrors = 0
  const MAX_CONSECUTIVE_ERRORS = 5

  const poll = async () => {
    if (isPolling) {
      return
    }

    isPolling = true
    try {
      const nextSignal = await callbacks.getSignal()
      if (!nextSignal) {
        consecutiveErrors = 0
        return
      }

      consecutiveErrors = 0
      console.log('Received signal:', nextSignal.type)
      await handleSignal(nextSignal, refs, callbacks)
    } catch (error) {
      consecutiveErrors += 1
      console.warn(
        `Signal polling error (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}):`,
        error,
      )

      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.error('Too many consecutive polling errors, stopping poll')
        if (refs.pollingRef.current) {
          window.clearInterval(refs.pollingRef.current)
          refs.pollingRef.current = null
        }
      }
    } finally {
      isPolling = false
    }
  }

  void poll()
  refs.pollingRef.current = window.setInterval(() => {
    void poll()
  }, SIGNAL_POLL_INTERVAL_MS)
}
