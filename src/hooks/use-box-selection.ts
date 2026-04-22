import { useCallback, useRef, useState } from 'react'

type Point = { x: number; y: number }
type Rect = { left: number; top: number; width: number; height: number }

function getRect(start: Point, end: Point): Rect {
  const left = Math.min(start.x, end.x)
  const top = Math.min(start.y, end.y)
  const width = Math.abs(start.x - end.x)
  const height = Math.abs(start.y - end.y)
  return { left, top, width, height }
}

function intersects(
  selection: { left: number; top: number; right: number; bottom: number },
  item: DOMRect,
) {
  return !(
    selection.right < item.left ||
    selection.left > item.right ||
    selection.bottom < item.top ||
    selection.top > item.bottom
  )
}

export function useBoxSelection() {
  const [start, setStart] = useState<Point | null>(null)
  const [current, setCurrent] = useState<Point | null>(null)
  const startRef = useRef<Point | null>(null)
  const currentRef = useRef<Point | null>(null)

  const beginSelection = useCallback((x: number, y: number) => {
    const point = { x, y }
    startRef.current = point
    currentRef.current = point
    setStart(point)
    setCurrent(point)
  }, [])

  const updateSelection = useCallback((x: number, y: number) => {
    const point = { x, y }
    currentRef.current = point
    setCurrent(point)
  }, [])

  const completeSelection = useCallback(
    (itemElements: HTMLElement[]): string[] => {
      const startPoint = startRef.current
      const currentPoint = currentRef.current
      if (!startPoint || !currentPoint) return []
      const rect = getRect(startPoint, currentPoint)
      const selectionBounds = {
        left: rect.left,
        top: rect.top,
        right: rect.left + rect.width,
        bottom: rect.top + rect.height,
      }
      const selectedIds: string[] = []
      itemElements.forEach((element) => {
        const id = element.dataset.storageItemId
        if (!id) return
        const itemRect = element.getBoundingClientRect()
        if (intersects(selectionBounds, itemRect)) {
          selectedIds.push(id)
        }
      })
      return selectedIds
    },
    [],
  )

  const cancelSelection = useCallback(() => {
    startRef.current = null
    currentRef.current = null
    setStart(null)
    setCurrent(null)
  }, [])

  const selectionRect = start && current ? getRect(start, current) : null

  return {
    isSelecting: !!selectionRect,
    selectionRect,
    beginSelection,
    updateSelection,
    completeSelection,
    cancelSelection,
  }
}
