import { useState } from 'react'
import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  changePasswordSettingsFn,
  rotateBackupCodesSettingsFn,
} from '../-settings-server'
import { updateSettings, useSettingsStore } from '../-store'

export function PasswordSection() {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  })
  const [twoFactorPassword] = useState('')

  const isChangingPassword = useSettingsStore(
    (state) => state.isChangingPassword,
  )
  const isUpdating2FA = useSettingsStore((state) => state.isUpdating2FA)
  const twoFactorEnabled = useSettingsStore((state) => state.twoFactorEnabled)

  const changePassword = async () => {
    updateSettings({ isChangingPassword: true })
    try {
      await changePasswordSettingsFn({ data: passwords })
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

  const rotateBackupCodes = async () => {
    updateSettings({ isUpdating2FA: true })
    try {
      const result = await rotateBackupCodesSettingsFn({
        data: { password: twoFactorPassword },
      })
      updateSettings({ backupCodes: result.backupCodes })
      toast.success('Backup codes rotated.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to rotate backup codes.',
      )
    } finally {
      updateSettings({ isUpdating2FA: false })
    }
  }

  return (
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
  )
}
