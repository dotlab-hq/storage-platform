import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

type NewFolderDialogProps = {
    open: boolean
    onOpenChange: ( open: boolean ) => void
    onConfirm: ( folderName: string ) => Promise<void> | void
}

export function NewFolderDialog( {
    open,
    onOpenChange,
    onConfirm,
}: NewFolderDialogProps ) {
    const [folderName, setFolderName] = React.useState( "New Folder" )
    const [isCreating, setIsCreating] = React.useState( false )
    const [error, setError] = React.useState<string | null>( null )
    const inputRef = React.useRef<HTMLInputElement>( null )

    React.useEffect( () => {
        if ( open ) {
            setFolderName( "New Folder" )
            setError( null )
            setIsCreating( false )
            // Select all text when dialog opens so user can immediately type
            setTimeout( () => {
                inputRef.current?.select()
            }, 50 )
        }
    }, [open] )

    const handleSubmit = async ( e: React.FormEvent ) => {
        e.preventDefault()
        const trimmed = folderName.trim()
        if ( !trimmed ) {
            setError( "Folder name cannot be empty." )
            return
        }
        setError( null )
        setIsCreating( true )
        try {
            await onConfirm( trimmed )
            onOpenChange( false )
        } catch ( err ) {
            setError( err instanceof Error ? err.message : String( err ) )
        } finally {
            setIsCreating( false )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>New Folder</DialogTitle>
                        <DialogDescription>
                            Enter a name for the new folder.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Input
                            ref={inputRef}
                            value={folderName}
                            onChange={( e ) => setFolderName( e.target.value )}
                            placeholder="Folder name"
                            autoFocus
                            disabled={isCreating}
                        />
                    </div>

                    <DialogFooter>
                        {error && (
                            <p className="text-destructive mr-auto text-sm">
                                {error}
                            </p>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange( false )}
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating}>
                            {isCreating ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
