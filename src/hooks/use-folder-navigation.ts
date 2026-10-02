import { useCallback } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { decodeNavToken, encodeNavToken } from '@/lib/nav-token'

/** Folder id encoded in the `?nav=` search param (null = "My Files" root). */
export function folderIdFromNav(nav: string | undefined): string | null {
  if (!nav) return null
  return decodeNavToken(nav)?.folderId ?? null
}

/**
 * The open folder lives in the URL, so back/forward, refresh and shared links
 * all work through the router (and its loader prefetching) for free.
 */
export function useCurrentFolderId(): string | null {
  return useSearch({
    from: '/_app/',
    select: (search) => folderIdFromNav(search.nav),
  })
}

export function useOpenFolder() {
  const navigate = useNavigate()
  return useCallback(
    (folderId: string | null) => {
      void navigate({
        to: '/',
        search: folderId ? { nav: encodeNavToken({ folderId }) } : {},
      })
    },
    [navigate],
  )
}
