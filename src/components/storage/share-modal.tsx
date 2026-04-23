import { useCallback, useEffect, useState } from 'react'
import { createClientOnlyFn } from '@tanstack/react-start'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/sonner'
import { Copy, Globe, Loader2, Link2, QrCode } from 'lucide-react'
import type { StorageItem, ShareLinkInfo } from '@/types/storage'
import { ShareQrDialog } from './share-qr-dialog'

// Dynamically load server functions
async function loadGetShareLinkFn() {
  const mod = await import('@/lib/storage/mutations/share')
  return mod.getShareLinkFn
}

async function loadCreateShareLinkFn() {
  const mod = await import('@/lib/storage/mutations/share')
  return mod.createShareLinkFn
}

async function loadToggleShareLinkFn() {
  const mod = await import('@/lib/storage/mutations/share')
  return mod.toggleShareLinkFn
}

type ShareModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: StorageItem | null
  userId: string | null
}

const fetchShareLink = createClientOnlyFn(
  async (itemId: string, itemType: 'file' | 'folder') => {
    const fn = await loadGetShareLinkFn()
    return await fn({ data: { itemId, itemType } })
  },
)

interface ShareActionCreate {
  action: 'create'
  itemId: string
  itemType: 'file' | 'folder'
  consentedPrivatelyUnlock: boolean
}

interface ShareActionToggle {
  action: 'toggle'
  linkId: string
  isActive: boolean
}

type ShareAction = ShareActionCreate | ShareActionToggle

const postShareAction = createClientOnlyFn(async (body: ShareAction) => {
  if (body.action === 'create') {
    const fn = await loadCreateShareLinkFn()
    return await fn({
      data: {
        itemId: body.itemId,
        itemType: body.itemType,
        consentedPrivatelyUnlock: body.consentedPrivatelyUnlock,
      },
    })
  } else if (body.action === 'toggle') {
    const fn = await loadToggleShareLinkFn()
    return await fn({
      data: {
        linkId: body.linkId,
        isActive: body.isActive,
      },
    })
  }
  throw new Error('Invalid action')
})

export function ShareModal({
  open,
  onOpenChange,
  item,
  userId,
}: ShareModalProps) {
  const [link, setLink] = useState<ShareLinkInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [consentedPrivatelyUnlock, setConsentedPrivatelyUnlock] =
    useState(false)
  const [showQrDialog, setShowQrDialog] = useState(false)

  const loadLink = useCallback(async () => {
    if (!item || !userId) return
    setLoading(true)
    try {
      const data = await fetchShareLink(item.id, item.type)
      setLink(data.link && data.link.isActive ? data.link : null)
    } finally {
      setLoading(false)
    }
  }, [item, userId])

  useEffect(() => {
    if (open) void loadLink()
  }, [open, loadLink])
  useEffect(() => {
    if (!open) setConsentedPrivatelyUnlock(false)
  }, [open])

  const handleCreate = async () => {
    if (!item || !userId) return
    setLoading(true)
    try {
      const data = await postShareAction({
        action: 'create',
        userId,
        itemId: item.id,
        itemType: item.type,
        consentedPrivatelyUnlock,
      })
      if (data.link) {
        setLink(data.link)
        toast.success('Share link created')
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error creating share link',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleToggleOff = async () => {
    if (!link || !userId) return
    setLoading(true)
    try {
      await postShareAction({
        action: 'toggle',
        userId,
        linkId: link.id,
        isActive: false,
      })
      setLink(null)
      toast.success('Share link disabled')
    } finally {
      setLoading(false)
    }
  }

  const shareUrl = link
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${link.shareToken}`
    : ''

  const copyLink = () => {
    void navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied to clipboard')
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share &ldquo;{item.name}&rdquo;</DialogTitle>
          <DialogDescription>
            Create a public link for read-only access.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : link ? (
          <ActiveShareView
            shareUrl={shareUrl}
            onCopy={copyLink}
            onDisable={handleToggleOff}
            onShowQr={() => setShowQrDialog(true)}
          />
        ) : (
          <NoShareView
            onCreate={handleCreate}
            isPrivatelyLocked={Boolean(item.isPrivatelyLocked)}
            consentedPrivatelyUnlock={consentedPrivatelyUnlock}
            onConsentedChange={setConsentedPrivatelyUnlock}
          />
        )}
      </DialogContent>
      <ShareQrDialog
        open={showQrDialog}
        onOpenChange={setShowQrDialog}
        shareUrl={shareUrl}
        itemName={item.name}
      />
    </Dialog>
  )
}

function ActiveShareView({
  shareUrl,
  onCopy,
  onDisable,
  onShowQr,
}: {
  shareUrl: string
  onCopy: () => void
  onDisable: () => void
  onShowQr: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Share link</Label>
        <div className="bg-muted flex flex-col items-start gap-2 rounded-md p-2 sm:flex-row sm:items-center overflow-hidden">
          <Link2 className="text-muted-foreground h-4 w-4 shrink-0 mt-0.5" />
          <span
            className="min-w-0 flex-1 break-all text-xs font-mono cursor-pointer hover:underline"
            onDoubleClick={() => window.open(shareUrl, '_blank')}
            title="Double-click to open in new tab"
          >
            {shareUrl}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="shrink-0 w-full sm:w-auto"
            onClick={onCopy}
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="ml-1 sm:hidden">Copy</span>
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 shrink-0" />
        <span className="text-sm">Anyone with this link can access</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onShowQr}
        >
          <QrCode className="mr-2 h-4 w-4" />
          QR Code
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1"
          onClick={onDisable}
        >
          Disable
        </Button>
      </div>
    </div>
  )
}

function NoShareView({
  onCreate,
  isPrivatelyLocked,
  consentedPrivatelyUnlock,
  onConsentedChange,
}: {
  onCreate: () => void
  isPrivatelyLocked: boolean
  consentedPrivatelyUnlock: boolean
  onConsentedChange: (value: boolean) => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="bg-muted rounded-full p-3">
        <Globe className="text-muted-foreground h-6 w-6" />
      </div>
      <p className="text-muted-foreground text-center text-sm">
        No active share link. Create one to allow read-only access.
      </p>
      {isPrivatelyLocked && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={consentedPrivatelyUnlock}
            onChange={(event) => onConsentedChange(event.target.checked)}
          />
          I consent to privately unlock this item for sharing.
        </label>
      )}
      <Button
        onClick={onCreate}
        disabled={isPrivatelyLocked && !consentedPrivatelyUnlock}
      >
        Create share link
      </Button>
    </div>
  )
}
