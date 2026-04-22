import type { ReactNode } from 'react'
import { MessageSquare, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

type ChatPageHeaderProps = {
  isMobile: boolean
  sheetOpen: boolean
  onSheetOpenChange: (open: boolean) => void
  threadPanelOpen: boolean
  onToggleThreadPanel: () => void
  sidebarContent: ReactNode
}

export function ChatPageHeader({
  isMobile,
  sheetOpen,
  onSheetOpenChange,
  threadPanelOpen,
  onToggleThreadPanel,
  sidebarContent,
}: ChatPageHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-2 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <MessageSquare className="text-muted-foreground h-4 w-4 shrink-0" />
        <h1 className="truncate text-sm font-semibold sm:text-base">
          Barrage Chat
        </h1>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        {isMobile ? (
          <Sheet open={sheetOpen} onOpenChange={onSheetOpenChange}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                Threads
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] p-0 sm:max-w-sm">
              <SheetHeader className="px-4 py-3">
                <SheetTitle>Chat Threads</SheetTitle>
                <SheetDescription>
                  Manage, rename, and delete conversations.
                </SheetDescription>
              </SheetHeader>
              <div className="h-[calc(100%-70px)]">{sidebarContent}</div>
            </SheetContent>
          </Sheet>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleThreadPanel}
            aria-label={
              threadPanelOpen
                ? 'Collapse thread sidebar'
                : 'Expand thread sidebar'
            }
          >
            {threadPanelOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </header>
  )
}
