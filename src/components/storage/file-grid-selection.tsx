import { useEffect, useRef } from 'react'

type SelectionRect = {
  left: number
  top: number
  width: number
  height: number
}

export function SelectionOverlay({ rect }: { rect: SelectionRect }) {
  const overlayRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = overlayRef.current
    if (!element) return

    element.style.left = `${rect.left}px`
    element.style.top = `${rect.top}px`
    element.style.width = `${rect.width}px`
    element.style.height = `${rect.height}px`
  }, [rect.height, rect.left, rect.top, rect.width])

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed z-30 border border-primary/60 bg-primary/20"
    />
  )
}
