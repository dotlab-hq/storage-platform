import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { getSettingsSnapshotFn } from './-settings-server'
import { updateSettings } from './-store'
import { ProfileSection } from './-components/profile-section'
import { AuthMethodsSection } from './-components/auth-methods-section'
import { TwoFactorSection } from './-components/two-factor-section'
import { PasswordSection } from './-components/password-section'
import { TinySessionsSection } from './-components/tiny-sessions-section'

export const Route = createFileRoute( '/settings/' )( {
  component: SettingsPage,
  loader: () => getSettingsSnapshotFn(),
} )

function SettingsPage() {
  const initial = Route.useLoaderData()

  useEffect( () => {
    updateSettings( {
      name: initial.user.name,
      image: initial.user.image,
      twoFactorEnabled: initial.security.twoFactorEnabled,
    } )
  }, [initial] )

  return (
    <div className="min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-sm font-semibold">Settings</h1>
          </header>
          <div className="grid gap-6 p-4 lg:grid-cols-2">
            <ProfileSection initial={initial} />
            <AuthMethodsSection initial={initial} />
            <TwoFactorSection />
            <PasswordSection />
            <TinySessionsSection initial={initial} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

