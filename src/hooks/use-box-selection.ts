import { useCallback, useState } from "react"

type Point = { x: number; y: number }
type Rect = { left: number; top: number; width: number; height: number }

function getRect( start: Point, end: Point ): Rect {
    const left = Math.min( start.x, end.x )
    const top = Math.min( start.y, end.y )
    const width = Math.abs( start.x - end.x )
    const height = Math.abs( start.y - end.y )
    return { left, top, width, height }
}

function intersects(
    selection: { left: number; top: number; right: number; bottom: number },
    item: DOMRect
) {
    return !(
        selection.right < item.left ||
        selection.left > item.right ||
        selection.bottom < item.top ||
        selection.top > item.bottom
    )
}

export function useBoxSelection() {
    const [start, setStart] = useState<Point | null>( null )
    const [current, setCurrent] = useState<Point | null>( null )

    const beginSelection = useCallback( ( x: number, y: number ) => {
        const point = { x, y }
        setStart( point )
        setCurrent( point )
    }, [] )

    const updateSelection = useCallback( ( x: number, y: number ) => {
        setCurrent( { x, y } )
    }, [] )

    const completeSelection = useCallback( (
        itemElements: HTMLElement[]
    ): string[] => {
        if ( !start || !current ) return []
        const rect = getRect( start, current )
        const selectionBounds = {
            left: rect.left,
            top: rect.top,
            right: rect.left + rect.width,
            bottom: rect.top + rect.height,
        }
        const selectedIds: string[] = []
        itemElements.forEach( ( element ) => {
            const id = element.dataset.storageItemId
            if ( !id ) return
            const itemRect = element.getBoundingClientRect()
            if ( intersects( selectionBounds, itemRect ) ) {
                selectedIds.push( id )
            }
        } )
        return selectedIds
    }, [current, start] )

    const cancelSelection = useCallback( () => {
        setStart( null )
        setCurrent( null )
    }, [] )

    const selectionRect = start && current ? getRect( start, current ) : null

    return {
        isSelecting: !!selectionRect,
        selectionRect,
        beginSelection,
        updateSelection,
        completeSelection,
        cancelSelection,
    }
}
