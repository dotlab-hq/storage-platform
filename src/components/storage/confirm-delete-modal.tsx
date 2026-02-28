import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

type ConfirmDeleteModalProps = {
    open: boolean
    onOpenChange: ( open: boolean ) => void
    isPermanent: boolean
    itemCount: number
    onConfirm: () => void
    isLoading?: boolean
}

export function ConfirmDeleteModal( {
    open,
    onOpenChange,
    isPermanent,
    itemCount,
    onConfirm,
    isLoading = false,
}: ConfirmDeleteModalProps ) {
    const label = itemCount === 1 ? "this item" : `${itemCount} items`

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isPermanent && (
                            <AlertTriangle className="text-destructive h-5 w-5" />
                        )}
                        {isPermanent ? "Delete permanently?" : "Move to Trash?"}
                    </DialogTitle>
                    <DialogDescription>
                        {isPermanent
                            ? `This will permanently delete ${label}. This action cannot be undone.`
                            : `${label} will be moved to Trash. You can restore later.`}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange( false )}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Deleting..."
                            : isPermanent
                                ? "Delete permanently"
                                : "Move to Trash"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
