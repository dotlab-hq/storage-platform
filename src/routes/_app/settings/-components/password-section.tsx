import { useState } from 'react'
import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyRound, Lock } from 'lucide-react'
import { updateSettings, useSettingsStore } from '../-store'

// Dynamically load server function
async function loadChangePasswordSettingsFn() {
  const mod = await import('../-settings-server')
  return mod.changePasswordSettingsFn
}

export function PasswordSection() {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  })
  const isChangingPassword = useSettingsStore(
    (state) => state.isChangingPassword,
  )

  const changePassword = async () => {
    updateSettings({ isChangingPassword: true })
    try {
      const fn = await loadChangePasswordSettingsFn()
      await fn({ data: passwords })
      setPasswords({ currentPassword: '', newPassword: '' })
      toast.success('Password updated.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update password.',
      )
    } finally {
      updateSettings({ isChangingPassword: false })
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-background via-background to-muted/30 p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
          <Lock className="text-primary size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Password</h2>
          <p className="text-muted-foreground text-sm">
            Change your account password
          </p>
        </div>
      </div>

      <div className="flex max-w-md flex-col gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Password</Label>
          <Input
            type="password"
            value={passwords.currentPassword}
            onChange={(e) =>
              setPasswords((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            placeholder="Enter current password"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">New Password</Label>
          <Input
            type="password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
            placeholder="Enter new password"
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button
            disabled={
              isChangingPassword ||
              !passwords.currentPassword ||
              !passwords.newPassword
            }
            onClick={() => void changePassword()}
          >
            {isChangingPassword ? (
              <>
                <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Updating...
              </>
            ) : (
              <>
                <KeyRound className="mr-2 size-4" />
                Change Password
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  )
}
