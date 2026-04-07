import { useEffect, useRef, useState } from 'react'
import { QrCode, Download } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import QRCode from 'qrcode'

type ShareQrDialogProps = {
    open: boolean
    onOpenChange: ( open: boolean ) => void
    shareUrl: string
    itemName: string
}

export function ShareQrDialog( {
    open,
    onOpenChange,
    shareUrl,
    itemName,
}: ShareQrDialogProps ) {
    const canvasRef = useRef<HTMLCanvasElement>( null )
    const [isGenerating, setIsGenerating] = useState( false )

    useEffect( () => {
        if ( !open || !canvasRef.current ) return

        setIsGenerating( true )
        QRCode.toCanvas( canvasRef.current, shareUrl, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        } )
            .then( () => {
                setIsGenerating( false )
            } )
            .catch( ( err ) => {
                console.error( 'Error generating QR code:', err )
                setIsGenerating( false )
            } )
    }, [open, shareUrl] )

    const downloadQR = () => {
        if ( !canvasRef.current ) return
        const link = document.createElement( 'a' )
        link.href = canvasRef.current.toDataURL( 'image/png' )
        link.download = `${itemName}-qr.png`
        link.click()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        Share QR Code
                    </DialogTitle>
                    <DialogDescription>
                        Scan this QR code to access &ldquo;{itemName}&rdquo;
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4 py-6">
                    <div className="bg-muted rounded-lg p-4">
                        <canvas
                            ref={canvasRef}
                            className="block border border-gray-200"
                        />
                    </div>

                    <div className="w-full space-y-2">
                        <Button
                            onClick={downloadQR}
                            disabled={isGenerating}
                            className="w-full"
                            variant="outline"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download QR Code
                        </Button>

                        <p className="text-center text-xs text-muted-foreground">
                            Share this QR code to allow others to access {itemName}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
