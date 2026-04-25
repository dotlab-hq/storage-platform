import { createFileRoute } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-start'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Folder,
  Loader2,
  Link2Off,
  Download,
  QrCode,
} from 'lucide-react'
import { toast } from '@/components/ui/sonner'
import { ShareFolderTree } from '@/components/storage/share-folder-tree'
import { ShareQrDialog } from '@/components/storage/share-qr-dialog'
import type { SharePagePayload } from './-share-access-server'

// Dynamically load server functions
async function loadGetSharePageDataFn() {
  const mod = await import('./-share-access-server')
  return mod.getSharePageDataFn
}

async function loadGetShareDownloadUrlFn() {
  const mod = await import('./-share-access-server')
  return mod.getShareDownloadUrlFn
}

type FileShareData = {
  type: 'file'
  name: string
  mimeType: string | null
  sizeInBytes: number
  presignedUrl: string
}

type FolderShareData = {
  type: 'folder'
  name: string
  folderId: string
  tree?: {
    rootFolderId: string
    rootFolderName: string
    folders: {
      id: string
      name: string
      parentFolderId: string | null
      depth: number
    }[]
    files: {
      id: string
      name: string
      mimeType: string | null
      sizeInBytes: number
      folderId: string | null
    }[]
  } | null
}

type ShareData = FileShareData | FolderShareData

type ShareLoaderData = {
  data: SharePagePayload | null
  error: string | null
}

export const Route = createFileRoute('/share/$token')({
  component: ShareAccessPage,
  loader: async ({ params }): Promise<ShareLoaderData> => {
    try {
      const fn = await loadGetSharePageDataFn()
      const data = await fn({ data: { token: params.token } })
      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'This share link is invalid, expired, or has been disabled.',
      }
    }
  },
})

function ShareAccessPage() {
  const { token } = Route.useParams()
  const { data, error } = Route.useLoaderData()
  const [downloading, setDownloading] = useState(false)
  const [showQr, setShowQr] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const fn = await loadGetShareDownloadUrlFn()
      const { url } = await fn({ data: { token } })
      const a = document.createElement('a')
      a.href = url
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      toast.error(
        `Download failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      )
    } finally {
      setDownloading(false)
    }
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="bg-muted rounded-full p-4">
          <Link2Off className="text-muted-foreground h-8 w-8" />
        </div>
        <h1 className="text-lg font-semibold">Link unavailable</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          {error ??
            'This share link is invalid, expired, or has been disabled.'}
        </p>
        <Button
          variant="outline"
          onClick={() => {
            window.location.href = '/'
          }}
        >
          Go to home
        </Button>
      </div>
    )
  }

  const typedData = data as ShareData
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  if (typedData.type === 'file') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
        <div className="bg-muted rounded-full p-4">
          <FileText className="text-muted-foreground h-10 w-10" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">{typedData.name}</h1>
          <p className="text-muted-foreground text-sm">
            {typedData.mimeType ?? 'File'} &middot;{' '}
            {formatBytes(typedData.sizeInBytes)}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => window.open(typedData.presignedUrl, '_blank')}>
            Open file
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleDownload()}
            disabled={downloading}
          >
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download
          </Button>
          <Button variant="outline" onClick={() => setShowQr(true)}>
            <QrCode className="mr-2 h-4 w-4" />
            QR Code
          </Button>
        </div>
        <ShareQrDialog
          open={showQr}
          onOpenChange={setShowQr}
          shareUrl={shareUrl}
          itemName={typedData.name}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="bg-muted rounded-full p-4">
        <Folder className="text-muted-foreground h-10 w-10" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">{typedData.name}</h1>
        <p className="text-muted-foreground text-sm">Shared folder</p>
        {typedData.tree && (
          <p className="text-muted-foreground text-xs">
            {typedData.tree.folders.length} folders ·{' '}
            {typedData.tree.files.length} files exposed
          </p>
        )}
      </div>
      {typedData.tree && (
        <ShareFolderTree tree={typedData.tree} formatBytes={formatBytes} />
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => {
            window.location.href = `/?nav=${btoa(JSON.stringify({ folderId: typedData.folderId }))}`
          }}
        >
          Open folder
        </Button>
        <Button variant="outline" onClick={() => setShowQr(true)}>
          <QrCode className="mr-2 h-4 w-4" />
          QR Code
        </Button>
      </div>
      <ShareQrDialog
        open={showQr}
        onOpenChange={setShowQr}
        shareUrl={shareUrl}
        itemName={typedData.name}
      />
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
