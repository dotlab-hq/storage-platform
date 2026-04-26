import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProviderContentsPanel } from '@/components/admin/provider-contents-panel'
import { ProviderInfoPanel } from '@/components/admin/provider-info-panel'
import { useProviderContents } from './use-provider-contents'
import type { AdminProvider } from '@/lib/storage-provider-queries'

type ProviderContentsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: AdminProvider | null
  scope?: 'admin' | 'user'
}

export function ProviderContentsModal({
  open,
  onOpenChange,
  provider,
  scope = 'admin',
}: ProviderContentsModalProps) {
  const viewer = useProviderContents(provider?.id ?? null, open, scope)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] w-[min(96vw,1280px)] max-w-[1280px] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b bg-linear-to-br from-background via-background to-muted/20 px-6 py-5">
          <DialogTitle className="text-xl font-semibold">
            Provider Details
          </DialogTitle>
          <DialogDescription>
            Manage and explore the contents of your storage provider.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="explorer"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="explorer">Explorer</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="explorer" className="flex-1 m-0 overflow-hidden">
            <ProviderContentsPanel viewer={viewer} />
          </TabsContent>
          <TabsContent value="info" className="flex-1 m-0 overflow-hidden">
            <ProviderInfoPanel provider={provider} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
