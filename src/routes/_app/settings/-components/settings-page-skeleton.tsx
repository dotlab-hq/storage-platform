import { SidebarInset } from '@/components/ui/sidebar'
import { PageHeader } from '@/components/app/page-header'
import { SETTINGS_BODY_CLASS } from './settings-page'

/** Same layout as the Settings page (header, tab strip, section card). */
export function SettingsPageSkeleton() {
  return (
    <SidebarInset>
      <PageHeader title="Settings" />
      <div
        className={SETTINGS_BODY_CLASS}
        role="status"
        aria-label="Loading settings"
      >
        <div className="flex flex-col gap-2">
          <div className="bg-muted mb-4 h-9 w-full animate-pulse rounded-lg" />
          <div className="bg-muted/60 h-96 w-full animate-pulse rounded-2xl" />
        </div>
      </div>
    </SidebarInset>
  )
}
