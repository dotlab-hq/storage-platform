import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSettingsSnapshotFn } from './-settings-server'
import { updateSettings } from './-store'
import { ProfileSection } from './-components/profile-section'
import { AuthMethodsSection } from './-components/auth-methods-section'
import { TwoFactorSection } from './-components/two-factor-section'
import { PasswordSection } from './-components/password-section'
import { TinySessionsSection } from './-components/tiny-sessions-section'
import { ApiKeysSection } from './-components/api-keys-section'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'

export const Route = createFileRoute('/_app/settings/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  component: SettingsPage,
  loader: () => getSettingsSnapshotFn(),
})

type SettingsTab =
  | 'profile'
  | 'auth'
  | '2fa'
  | 'password'
  | 'sessions'
  | 'api-keys'

const tabs: { id: SettingsTab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'auth', label: 'Auth Methods' },
  { id: '2fa', label: 'Two-Factor' },
  { id: 'password', label: 'Password' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'api-keys', label: 'API Keys' },
]

function SettingsPage() {
  const initial = Route.useLoaderData()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

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
      <div className="flex h-[calc(100vh-theme(spacing.14))] p-4">
        <main className="flex-1 overflow-auto">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as SettingsTab)}
          >
            <TabsList className="mb-4 flex h-auto w-full flex-nowrap overflow-x-auto gap-1 p-1 md:grid md:grid-cols-6">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex-shrink-0 py-1.5 text-xs md:text-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {activeTab === 'profile' && <ProfileSection initial={initial} />}
          {activeTab === 'auth' && <AuthMethodsSection initial={initial} />}
          {activeTab === '2fa' && <TwoFactorSection />}
          {activeTab === 'password' && <PasswordSection />}
          {activeTab === 'sessions' && (
            <TinySessionsSection initial={initial} />
          )}
          {activeTab === 'api-keys' && (
            <ApiKeysSection initialKeys={initial.apiKeys} />
          )}
        </main>
      </div>
    </SidebarInset>
  )
}
