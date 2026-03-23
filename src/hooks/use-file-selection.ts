import { useCallback, useState } from "react"
import type { StorageItem } from "@/types/storage"

type SelectionState = {
    selectedIds: Set<string>
    lastSelectedId: string | null
}

export function useFileSelection( items: StorageItem[] ) {
    const [state, setState] = useState<SelectionState>( {
        selectedIds: new Set(),
        lastSelectedId: null,
    } )

    const select = useCallback( ( id: string, shiftKey = false ) => {
        setState( ( prev ) => {
            if ( shiftKey && prev.lastSelectedId ) {
                const lastIndex = items.findIndex(
                    ( item ) => item.id === prev.lastSelectedId
                )
                const currentIndex = items.findIndex( ( item ) => item.id === id )

                if ( lastIndex === -1 || currentIndex === -1 ) {
                    return { selectedIds: new Set( [id] ), lastSelectedId: id }
                }

                const start = Math.min( lastIndex, currentIndex )
                const end = Math.max( lastIndex, currentIndex )
                const rangeIds = items.slice( start, end + 1 ).map( ( item ) => item.id )

                return {
                    selectedIds: new Set( [...prev.selectedIds, ...rangeIds] ),
                    lastSelectedId: id,
                }
            }

            return { selectedIds: new Set( [id] ), lastSelectedId: id }
        } )
    }, [items] )

    const toggleSelect = useCallback( ( id: string ) => {
        setState( ( prev ) => {
            const next = new Set( prev.selectedIds )
            if ( next.has( id ) ) {
                next.delete( id )
            } else {
                next.add( id )
            }
            return { selectedIds: next, lastSelectedId: id }
        } )
    }, [] )

    const clearSelection = useCallback( () => {
        setState( { selectedIds: new Set(), lastSelectedId: null } )
    }, [] )

    const selectMany = useCallback( ( ids: string[], append = false ) => {
        setState( ( prev ) => {
            const nextSelected = append ? new Set( prev.selectedIds ) : new Set<string>()
            ids.forEach( ( id ) => nextSelected.add( id ) )
            const lastId = ids.length > 0 ? ids[ids.length - 1] : append ? prev.lastSelectedId : null
            return { selectedIds: nextSelected, lastSelectedId: lastId }
        } )
    }, [] )

    const selectAll = useCallback( () => {
        setState( {
            selectedIds: new Set( items.map( ( item ) => item.id ) ),
            lastSelectedId: items[items.length - 1]?.id ?? null,
        } )
    }, [items] )

    const isSelected = useCallback(
        ( id: string ) => state.selectedIds.has( id ),
        [state.selectedIds]
    )

    return {
        selectedIds: state.selectedIds,
        selectedCount: state.selectedIds.size,
        select,
        toggleSelect,
        selectMany,
        clearSelection,
        selectAll,
        isSelected,
    }
}
