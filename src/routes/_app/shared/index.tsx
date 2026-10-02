import { createFileRoute } from '@tanstack/react-router'
import { Share2 } from 'lucide-react'
import { SidebarInset } from '@/components/ui/sidebar'
import { PageHeader } from '@/components/app/page-header'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'

export const Route = createFileRoute('/_app/shared/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  component: SharedPage,
})

/** "Shared with me". Sharing between accounts is not built yet, so this is an honest empty state. */
function SharedPage() {
  return (
    <SidebarInset>
      <PageHeader
        title="Shared with Me"
        icon={<Share2 className="text-muted-foreground h-4 w-4" />}
      />
      <div className="flex flex-1 flex-col items-center justify-center p-4 pt-0 text-center">
        <div className="bg-muted mb-4 rounded-full p-4">
          <Share2 className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="text-foreground mb-1 text-sm font-medium">
          Nothing shared with you yet
        </h3>
        <p className="text-muted-foreground max-w-sm text-sm">
          Sharing between accounts isn't available yet. To share a file now,
          select it in My Files and choose Share to create a link.
        </p>
      </div>
    </SidebarInset>
  )
}
