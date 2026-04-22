import { useEffect } from 'react'

type ObserverParams = {
  enabled: boolean
  target: HTMLDivElement | null
  isFetching: boolean
  onLoadMore: () => void
  rootMargin: string
  isTopObserver?: boolean
}

export function usePaginationObserver({
  enabled,
  target,
  isFetching,
  onLoadMore,
  rootMargin,
  isTopObserver = false,
}: ObserverParams) {
  useEffect(() => {
    if (!enabled || !target) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetching) {
          onLoadMore()
        }
      },
      { rootMargin },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [enabled, target, isFetching, onLoadMore, rootMargin, isTopObserver])
}
