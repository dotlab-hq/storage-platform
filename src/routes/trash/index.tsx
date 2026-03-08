import { createFileRoute } from "@tanstack/react-router"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDeleteModal } from "@/components/storage/confirm-delete-modal"
import { TrashContent } from "@/components/storage/trash-content"
import { useState } from "react"
import { useTrashData } from "@/hooks/use-trash-data"
import { useQuota } from "@/hooks/use-quota"

export const Route = createFileRoute( "/trash/" )( { component: TrashPage } )

function TrashPage() {
    const quota = useQuota()
    const [deleteOpen, setDeleteOpen] = useState( false )
    const [pendingDelete, setPendingDelete] = useState<{ ids: string[]; types: ( "file" | "folder" )[] } | null>( null )
    const [isDeleting, setIsDeleting] = useState( false )
    const trash = useTrashData()

    const handleRestoreOne = ( id: string, type: "file" | "folder" ) => {
        void trash.handleRestore( [id], [type] )
    }

    const handleDeleteOne = ( id: string, type: "file" | "folder" ) => {
        setPendingDelete( { ids: [id], types: [type] } )
        setDeleteOpen( true )
    }

    const handleEmptyTrash = () => {
        if ( trash.items.length === 0 ) return
        setPendingDelete( {
            ids: trash.items.map( ( i ) => i.id ),
            types: trash.items.map( ( i ) => i.type ),
        } )
        setDeleteOpen( true )
    }

    const handleRestoreAll = () => {
        if ( trash.items.length === 0 ) return
        void trash.handleRestore(
            trash.items.map( ( i ) => i.id ),
            trash.items.map( ( i ) => i.type )
        )
    }

    const confirmPermanentDelete = async () => {
        if ( !pendingDelete ) return
        setIsDeleting( true )
        try {
            await trash.handlePermanentDelete( pendingDelete.ids, pendingDelete.types )
        } finally {
            setIsDeleting( false )
            setDeleteOpen( false )
            setPendingDelete( null )
        }
    }

    return (
        <div className="min-h-screen">
            <SidebarProvider>
                <AppSidebar quota={quota} />
                <SidebarInset>
                    <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-4">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <Trash2 className="text-muted-foreground h-4 w-4" />
                            <h1 className="text-sm font-semibold">Trash</h1>
                        </div>
                        {trash.items.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={handleRestoreAll}>
                                    <RotateCcw className="mr-1 h-3 w-3" />
                                    Restore all
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleEmptyTrash}
                                >
                                    <AlertTriangle className="mr-1 h-3 w-3" />
                                    Empty trash
                                </Button>
                            </div>
                        )}
                    </header>

                    <TrashContent
                        items={trash.items}
                        isLoading={trash.isLoading}
                        onRestore={handleRestoreOne}
                        onDelete={handleDeleteOne}
                    />
                </SidebarInset>
            </SidebarProvider>

            <ConfirmDeleteModal
                open={deleteOpen}
                onOpenChange={( open ) => {
                    setDeleteOpen( open )
                    if ( !open ) setPendingDelete( null )
                }}
                isPermanent
                itemCount={pendingDelete?.ids.length ?? 1}
                onConfirm={() => void confirmPermanentDelete()}
                isLoading={isDeleting}
            />
        </div>
    )
}
