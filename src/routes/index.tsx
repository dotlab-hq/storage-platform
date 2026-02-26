import { authClient } from '@/lib/auth-client'
import { createFileRoute } from '@tanstack/react-router'
import { createClientOnlyFn } from '@tanstack/react-start'
import { useEffect } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { HeaderUploadMenu } from '@/components/header-upload-menu'
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useState } from 'react'

export const Route = createFileRoute( '/' )( { component: App } )

function App() {
  const [userId, setUserId] = useState<string | null>( null )
  const [rootFolders, setRootFolders] = useState<
    Array<{ id: string; name: string; createdAt: Date }>
  >( [] )
  const [rootFiles, setRootFiles] = useState<
    Array<{ id: string; name: string; sizeInBytes: number; createdAt: Date }>
  >( [] )

  // check if the user is authenticated and redirect to /auth if not
  const checkAuthSession = createClientOnlyFn( async () => {
    const { data, error } = await authClient.getSession()
    if ( error ) {
      window.location.href = "/auth"
      return null
    }

    if ( !data?.user ) {
      window.location.href = "/auth"
      return null
    }

    return data.user.id
  } )

  const fetchRootItems = createClientOnlyFn( async ( currentUserId: string ) => {
    const response = await fetch( `/api/storage/root-items?userId=${encodeURIComponent( currentUserId )}` )
    const data = await response.json() as {
      folders?: Array<{ id: string; name: string; createdAt: string }>
      files?: Array<{ id: string; name: string; sizeInBytes: number; createdAt: string }>
      error?: string
    }

    if ( !response.ok ) {
      throw new Error( data.error || `HTTP ${response.status}` )
    }

    return {
      folders: ( data.folders ?? [] ).map( ( folder ) => ( {
        ...folder,
        createdAt: new Date( folder.createdAt ),
      } ) ),
      files: ( data.files ?? [] ).map( ( file ) => ( {
        ...file,
        createdAt: new Date( file.createdAt ),
      } ) ),
    }
  } )

  const refreshRootItems = async ( currentUserId: string ) => {
    const rootItems = await fetchRootItems( currentUserId )
    setRootFolders( rootItems.folders )
    setRootFiles( rootItems.files )
  }

  useEffect( () => {
    void checkAuthSession().then( async ( authenticatedUserId ) => {
      if ( !authenticatedUserId ) {
        return
      }

      setUserId( authenticatedUserId )
      await refreshRootItems( authenticatedUserId )
    } )
  }, [] )


  return (
    <div className="min-h-screen ">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
            </div>
            <HeaderUploadMenu
              userId={userId}
              onUploadComplete={async () => {
                if ( !userId ) {
                  return
                }

                await refreshRootItems( userId )
              }}
            />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="rounded-xl border p-4">
              <h2 className="mb-3 text-sm font-semibold">Root folders</h2>
              {rootFolders.length === 0 ? (
                <p className="text-muted-foreground text-sm">No root folders.</p>
              ) : (
                <ul className="space-y-2">
                  {rootFolders.map( ( currentFolder ) => (
                    <li
                      key={currentFolder.id}
                      className="bg-muted/40 rounded-md px-3 py-2 text-sm"
                    >
                      {currentFolder.name}
                    </li>
                  ) )}
                </ul>
              )}
            </div>

            <div className="rounded-xl border p-4">
              <h2 className="mb-3 text-sm font-semibold">Root files</h2>
              {rootFiles.length === 0 ? (
                <p className="text-muted-foreground text-sm">No root files.</p>
              ) : (
                <ul className="space-y-2">
                  {rootFiles.map( ( currentFile ) => (
                    <li
                      key={currentFile.id}
                      className="bg-muted/40 flex items-center justify-between rounded-md px-3 py-2 text-sm"
                    >
                      <span className="truncate">{currentFile.name}</span>
                      <span className="text-muted-foreground ml-3 shrink-0 text-xs">
                        {( currentFile.sizeInBytes / 1024 ).toFixed( 2 )} KB
                      </span>
                    </li>
                  ) )}
                </ul>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
