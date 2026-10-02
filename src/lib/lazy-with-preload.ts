import { lazy } from 'react'
import type { ComponentType } from 'react'

/**
 * `React.lazy` plus a `preload()` you can call ahead of time (e.g. on idle),
 * so the component is ready by the time the user opens it and no Suspense
 * fallback ever shows.
 */
export function lazyWithPreload<T extends ComponentType<any>>(
  load: () => Promise<{ default: T }>,
) {
  let promise: Promise<{ default: T }> | undefined
  const preload = () => (promise ??= load())
  return Object.assign(lazy(preload), { preload })
}

/** Runs `preload` functions once the browser is idle after first paint. */
export function preloadWhenIdle(...preloads: Array<() => unknown>) {
  if (typeof window === 'undefined') return () => {}
  const run = () => preloads.forEach((preload) => void preload())
  if ('requestIdleCallback' in window) {
    const handle = window.requestIdleCallback(run, { timeout: 3000 })
    return () => window.cancelIdleCallback(handle)
  }
  const handle = setTimeout(run, 1500)
  return () => clearTimeout(handle)
}
