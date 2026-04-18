'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { Folder, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buildFolderPathOptions } from '@/lib/folder-paths'
import type { IncomingFile } from '@/hooks/use-webrtc'
import { formatFileSize } from '@/lib/file-utils'

import { getAllFoldersFn } from '@/lib/storage/queries/server'

type FolderOption = { id: string; name: string; parentFolderId: string | null }

type SaveFileDialogProps = {
  open: boolean
  onOpenChange: ( open: boolean ) => void
  file: IncomingFile | null
  currentFolderId: string | null
  userId: string | null
  onSave: ( targetFolderId: string | null ) => void
}

export function SaveFileDialog( {
  open,
  onOpenChange,
  file,
  currentFolderId,
  userId,
  onSave,
}: SaveFileDialogProps ) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>( null )
  const [pathQuery, setPathQuery] = useState( '' )
  const [allFolders, setAllFolders] = useState<FolderOption[]>( [] )
  const [fetching, setFetching] = useState( false )

  const handleOpen = ( isOpen: boolean ) => {
    if ( isOpen ) {
      setSelectedFolder( currentFolderId )
      setPathQuery( '' )
      if ( userId ) {
        setFetching( true )
        void getAllFoldersFn()
          .then( ( data ) => {
            setAllFolders( data.folders || [] )
          } )
          .finally( () => setFetching( false ) )
      }
    }
    onOpenChange( isOpen )
  }

  const folderOptions = buildFolderPathOptions( allFolders ).filter( ( f ) =>
    f.path.toLowerCase().includes( pathQuery.toLowerCase() ),
  )

  const handleSave = () => {
    onSave( selectedFolder )
    onOpenChange( false )
  }

  if ( !file ) return null

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save file to storage</DialogTitle>
          <DialogDescription>
            Choose where to save "{file.name}" ({formatFileSize( file.size )})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search folders..."
              value={pathQuery}
              onChange={( e ) => setPathQuery( e.target.value )}
              className="pl-9"
            />
          </div>

          <div className="max-h-64 overflow-y-auto rounded-md border">
            <div
              className={cn(
                'cursor-pointer p-2 hover:bg-accent',
                selectedFolder === null && 'bg-accent',
              )}
              onClick={() => setSelectedFolder( null )}
            >
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Root (home)</span>
              </div>
            </div>
            {folderOptions.map( ( folder ) => (
              <div
                key={folder.id}
                className={cn(
                  'cursor-pointer p-2 hover:bg-accent',
                  selectedFolder === folder.id && 'bg-accent',
                )}
                onClick={() => setSelectedFolder( folder.id )}
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{folder.name}</span>
                  {folder.parentFolderId && (
                    <span className="text-xs text-muted-foreground">
                      (in {folder.parentFolderId})
                    </span>
                  )}
                </div>
              </div>
            ) )}
            {fetching && (
              <div className="space-y-2 p-2">
                <PageSkeleton variant="default" className="h-9" />
                <PageSkeleton variant="default" className="h-9" />
                <PageSkeleton variant="default" className="h-9" />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange( false )}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedFolder}>
            Save here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
