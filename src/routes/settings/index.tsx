import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from '@/components/ui/sonner'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  changePasswordSettingsFn,
  disableTwoFactorSettingsFn,
  enableTwoFactorSettingsFn,
  getSettingsSnapshotFn,
  rotateBackupCodesSettingsFn,
  updateProfileSettingsFn,
  verifyTwoFactorSettingsFn,
} from './-settings-server'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
  loader: () => getSettingsSnapshotFn(),
})

function SettingsPage() {
  const initial = Route.useLoaderData()
  const [name, setName] = useState(initial.user.name)
  const [image, setImage] = useState(initial.user.image)
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  })
  const [twoFactorPassword, setTwoFactorPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    initial.security.twoFactorEnabled,
  )
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUpdating2FA, setIsUpdating2FA] = useState(false)

  const saveProfile = async () => {
    const previous = { name: initial.user.name, image: initial.user.image }
    setIsSavingProfile(true)
    try {
      await updateProfileSettingsFn({ data: { name, image } })
      toast.success('Profile saved.')
    } catch (error) {
      setName(previous.name)
      setImage(previous.image)
      toast.error(
        error instanceof Error ? error.message : 'Failed to save profile.',
      )
    } finally {
      setIsSavingProfile(false)
    }
  }

  const changePassword = async () => {
    setIsChangingPassword(true)
    try {
      await changePasswordSettingsFn({ data: passwords })
      setPasswords({ currentPassword: '', newPassword: '' })
      toast.success('Password updated.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update password.',
      )
    } finally {
      setIsChangingPassword(false)
    }
  }

  const enable2FA = async () => {
    const previous = twoFactorEnabled
    setIsUpdating2FA(true)
    setTwoFactorEnabled(true)
    try {
      const result = await enableTwoFactorSettingsFn({
        data: { password: twoFactorPassword },
      })
      setBackupCodes(result.backupCodes)
      toast.success('Scan QR from your authenticator, then verify code below.')
    } catch (error) {
      setTwoFactorEnabled(previous)
      toast.error(
        error instanceof Error ? error.message : 'Failed to enable 2FA.',
      )
    } finally {
      setIsUpdating2FA(false)
    }
  }

  const verify2FA = async () => {
    setIsUpdating2FA(true)
    try {
      await verifyTwoFactorSettingsFn({ data: { code: totpCode } })
      setTotpCode('')
      toast.success('2FA verified.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to verify 2FA code.',
      )
    } finally {
      setIsUpdating2FA(false)
    }
  }

  const disable2FA = async () => {
    const previous = twoFactorEnabled
    setIsUpdating2FA(true)
    setTwoFactorEnabled(false)
    try {
      await disableTwoFactorSettingsFn({
        data: { password: twoFactorPassword },
      })
      setBackupCodes([])
      toast.success('2FA disabled.')
    } catch (error) {
      setTwoFactorEnabled(previous)
      toast.error(
        error instanceof Error ? error.message : 'Failed to disable 2FA.',
      )
    } finally {
      setIsUpdating2FA(false)
    }
  }

  const rotateBackupCodes = async () => {
    setIsUpdating2FA(true)
    try {
      const result = await rotateBackupCodesSettingsFn({
        data: { password: twoFactorPassword },
      })
      setBackupCodes(result.backupCodes)
      toast.success('Backup codes rotated.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to rotate backup codes.',
      )
    } finally {
      setIsUpdating2FA(false)
    }
  }

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
            <section className="space-y-3 rounded-lg border p-4">
              <h2 className="text-base font-semibold">Profile</h2>
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Avatar URL</Label>
                <Input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>
              <Button
                disabled={isSavingProfile}
                onClick={() => void saveProfile()}
              >
                {isSavingProfile ? 'Saving...' : 'Save profile'}
              </Button>
            </section>
            <section className="space-y-3 rounded-lg border p-4">
              <h2 className="text-base font-semibold">
                Authentication Methods
              </h2>
              <p className="text-muted-foreground text-sm">
                Role: {initial.user.role}
              </p>
              <p className="text-muted-foreground text-sm">
                Passkeys: Not configured
              </p>
              <ul className="space-y-1">
                {initial.methods.map((method) => (
                  <li key={method.id} className="text-sm">
                    {method.providerId} • {method.accountId}
                  </li>
                ))}
                {initial.methods.length === 0 && (
                  <li className="text-muted-foreground text-sm">
                    No linked methods
                  </li>
                )}
              </ul>
            </section>
            <section className="space-y-3 rounded-lg border p-4">
              <h2 className="text-base font-semibold">
                Two-Factor Authentication
              </h2>
              <div className="space-y-1">
                <Label>Account password</Label>
                <Input
                  type="password"
                  value={twoFactorPassword}
                  onChange={(e) => setTwoFactorPassword(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={isUpdating2FA || twoFactorEnabled}
                  onClick={() => void enable2FA()}
                >
                  Enable 2FA
                </Button>
                <Button
                  variant="outline"
                  disabled={isUpdating2FA || !twoFactorEnabled}
                  onClick={() => void disable2FA()}
                >
                  Disable 2FA
                </Button>
              </div>
              <div className="space-y-1">
                <Label>Authenticator code</Label>
                <Input
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                disabled={isUpdating2FA || !twoFactorEnabled}
                onClick={() => void verify2FA()}
              >
                Verify code
              </Button>
              {backupCodes.length > 0 && (
                <div className="rounded-md bg-muted p-3 text-xs">
                  Backup codes: {backupCodes.join(', ')}
                </div>
              )}
            </section>
            <section className="space-y-3 rounded-lg border p-4">
              <h2 className="text-base font-semibold">Password</h2>
              <div className="space-y-1">
                <Label>Current password</Label>
                <Input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>New password</Label>
                <Input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={isChangingPassword}
                  onClick={() => void changePassword()}
                >
                  {isChangingPassword ? 'Updating...' : 'Change password'}
                </Button>
                <Button
                  variant="outline"
                  disabled={isUpdating2FA || !twoFactorEnabled}
                  onClick={() => void rotateBackupCodes()}
                >
                  Rotate backup codes
                </Button>
              </div>
            </section>
            <section className="space-y-3 rounded-lg border p-4 lg:col-span-2">
              <h2 className="text-base font-semibold">Tiny Sessions</h2>
              <p className="text-muted-foreground text-sm">
                Scan-based sessions last 10 minutes. Recent entries are shown
                below.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2 rounded-md border p-3">
                  <h3 className="text-sm font-medium">Active</h3>
                  <ul className="space-y-1">
                    {initial.tinySessions.active.map((session) => (
                      <li key={session.id} className="text-sm">
                        {session.permission} • expires{' '}
                        {new Date(session.expiresAt).toLocaleTimeString()}
                      </li>
                    ))}
                    {initial.tinySessions.active.length === 0 && (
                      <li className="text-muted-foreground text-sm">
                        No active tiny sessions.
                      </li>
                    )}
                  </ul>
                </div>
                <div className="space-y-2 rounded-md border p-3">
                  <h3 className="text-sm font-medium">Recent</h3>
                  <ul className="space-y-1">
                    {initial.tinySessions.recent.slice(0, 8).map((session) => (
                      <li key={session.id} className="text-sm">
                        {session.permission} • created{' '}
                        {new Date(session.createdAt).toLocaleString()}
                      </li>
                    ))}
                    {initial.tinySessions.recent.length === 0 && (
                      <li className="text-muted-foreground text-sm">
                        No tiny sessions yet.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
