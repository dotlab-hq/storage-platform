import { useEffect, useState } from 'react'
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
  onOpenChange: (open: boolean) => void
  shareUrl: string
  itemName: string
}

export function ShareQrDialog({
  open,
  onOpenChange,
  shareUrl,
  itemName,
}: ShareQrDialogProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (!open || !shareUrl) return

    setIsGenerating(true)
    QRCode.toDataURL(shareUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        setQrDataUrl(url)
        setIsGenerating(false)
      })
      .catch((err) => {
        console.error('Error generating QR code:', err)
        setIsGenerating(false)
      })
  }, [open, shareUrl])

  const downloadQR = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrDataUrl
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
          <div className="bg-muted rounded-lg p-4 min-h-[300px] min-w-[300px] flex items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="block border border-gray-200"
              />
            ) : (
              <div className="animate-pulse bg-gray-200 w-[300px] h-[300px] rounded" />
            )}
          </div>

          <div className="w-full space-y-2">
            <Button
              onClick={downloadQR}
              disabled={isGenerating || !qrDataUrl}
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
