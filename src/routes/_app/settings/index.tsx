import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSettingsSnapshotFn } from './-settings-server'
import { updateSettings } from './-store'
import { ProfileSection } from './-components/profile-section'
import { AuthMethodsSection } from './-components/auth-methods-section'
import { TwoFactorSection } from './-components/two-factor-section'
import { PasswordSection } from './-components/password-section'
import { TinySessionsSection } from './-components/tiny-sessions-section'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'

export const Route = createFileRoute('/_app/settings/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  component: SettingsPage,
  loader: () => getSettingsSnapshotFn(),
})

function SettingsPage() {
  const initial = Route.useLoaderData()
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    updateSettings({
      name: initial.user.name,
      image: initial.user.image,
      twoFactorEnabled: initial.security.twoFactorEnabled,
    })
  }, [initial])

  return (
    <SidebarInset>
      <header className="flex h-14 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-sm font-semibold">Settings</h1>
      </header>
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-5 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="auth">Auth Methods</TabsTrigger>
            <TabsTrigger value="2fa">2FA</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 p-6 dark:from-slate-800 dark:to-slate-900">
              <ProfileSection initial={initial} />
            </div>
          </TabsContent>
          <TabsContent value="auth">
            <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 p-6 dark:from-slate-800 dark:to-slate-900">
              <AuthMethodsSection initial={initial} />
            </div>
          </TabsContent>
          <TabsContent value="2fa">
            <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 p-6 dark:from-slate-800 dark:to-slate-900">
              <TwoFactorSection />
            </div>
          </TabsContent>
          <TabsContent value="password">
            <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 p-6 dark:from-slate-800 dark:to-slate-900">
              <PasswordSection />
            </div>
          </TabsContent>
          <TabsContent value="sessions">
            <div className="rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 p-6 dark:from-slate-800 dark:to-slate-900">
              <TinySessionsSection initial={initial} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
