import { useState } from 'react'
import type { ReactNode } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import {
  Download,
  FileText,
  Folder,
  Link2Off,
  Loader2,
  QrCode,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/sonner'
import { ShareFolderTree } from '@/components/storage/share-folder-tree'
import { ShareQrDialog } from '@/components/storage/share-qr-dialog'
import { formatBytes } from '@/lib/format-bytes'
import { encodeNavToken } from '@/lib/nav-token'
import {
  getShareFileUrlFn,
  getSharePageDataFn,
} from '@/lib/share-access-server'
import type { SharePagePayload } from '@/lib/share-access-server'

type ShareLoaderData = {
  data: SharePagePayload | null
  error: string | null
}

const UNAVAILABLE_MESSAGE =
  'This share link is invalid, expired, or has been disabled.'

export const Route = createFileRoute('/share/$token')({
  component: ShareAccessPage,
  loader: async ({ params }): Promise<ShareLoaderData> => {
    try {
      const data = await getSharePageDataFn({ data: { token: params.token } })
      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : UNAVAILABLE_MESSAGE,
      }
    }
  },
})

/** Public page for a share link: a file (open/download) or a folder tree. */
function ShareAccessPage() {
  const { data, error } = Route.useLoaderData()
  // The page URL is read when the QR dialog opens, never during render.
  const [qrUrl, setQrUrl] = useState<string | null>(null)

  if (error || !data) return <ShareUnavailable message={error} />

  const qrButton = (
    <Button variant="outline" onClick={() => setQrUrl(window.location.href)}>
      <QrCode className="mr-2 h-4 w-4" />
      QR Code
    </Button>
  )

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
      {data.type === 'file' ? (
        <SharedFile file={data} qrButton={qrButton} />
      ) : (
        <SharedFolder folder={data} qrButton={qrButton} />
      )}
      <ShareQrDialog
        open={qrUrl !== null}
        onOpenChange={(open) => {
          if (!open) setQrUrl(null)
        }}
        shareUrl={qrUrl ?? ''}
        itemName={data.name}
      />
    </div>
  )
}

type SharedFileData = Extract<SharePagePayload, { type: 'file' }>
type SharedFolderData = Extract<SharePagePayload, { type: 'folder' }>

function SharedFile({
  file,
  qrButton,
}: {
  file: SharedFileData
  qrButton: ReactNode
}) {
  const { token } = Route.useParams()

  // Both buttons ask for a fresh signed URL, so they keep working however
  // long the page has been open (signed URLs expire after an hour).
  const open = useMutation({
    mutationFn: async () => {
      // Open the tab inside the click so popup blockers allow it, then
      // point it at the URL once we have it.
      const tab = window.open('', '_blank')
      try {
        const { url } = await getShareFileUrlFn({
          data: { token, disposition: 'inline' },
        })
        if (tab) tab.location.href = url
        else window.open(url, '_blank')
      } catch (error) {
        tab?.close()
        throw error
      }
    },
    onError: (error) => toast.error(`Could not open file: ${error.message}`),
  })

  const download = useMutation({
    mutationFn: () =>
      getShareFileUrlFn({ data: { token, disposition: 'attachment' } }),
    onSuccess: ({ url }) => {
      const anchor = document.createElement('a')
      anchor.href = url
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
    },
    onError: (error) => toast.error(`Download failed: ${error.message}`),
  })

  return (
    <>
      <div className="bg-muted rounded-full p-4">
        <FileText className="text-muted-foreground h-10 w-10" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">{file.name}</h1>
        <p className="text-muted-foreground text-sm">
          {file.mimeType ?? 'File'} &middot; {formatBytes(file.sizeInBytes)}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => open.mutate()} disabled={open.isPending}>
          {open.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Open file
        </Button>
        <Button
          variant="outline"
          onClick={() => download.mutate()}
          disabled={download.isPending}
        >
          {download.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download
        </Button>
        {qrButton}
      </div>
    </>
  )
}

function SharedFolder({
  folder,
  qrButton,
}: {
  folder: SharedFolderData
  qrButton: ReactNode
}) {
  return (
    <>
      <div className="bg-muted rounded-full p-4">
        <Folder className="text-muted-foreground h-10 w-10" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">{folder.name}</h1>
        <p className="text-muted-foreground text-sm">Shared folder</p>
        {folder.tree && (
          <p className="text-muted-foreground text-xs">
            {folder.tree.folders.length} folders · {folder.tree.files.length}{' '}
            files exposed
          </p>
        )}
      </div>
      {folder.tree && (
        <ShareFolderTree tree={folder.tree} formatBytes={formatBytes} />
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link
            to="/"
            search={{ nav: encodeNavToken({ folderId: folder.folderId }) }}
          >
            Open folder
          </Link>
        </Button>
        {qrButton}
      </div>
    </>
  )
}

function ShareUnavailable({ message }: { message: string | null }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="bg-muted rounded-full p-4">
        <Link2Off className="text-muted-foreground h-8 w-8" />
      </div>
      <h1 className="text-lg font-semibold">Link unavailable</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        {message ?? UNAVAILABLE_MESSAGE}
      </p>
      <Button variant="outline" asChild>
        <Link to="/">Go to home</Link>
      </Button>
    </div>
  )
}
