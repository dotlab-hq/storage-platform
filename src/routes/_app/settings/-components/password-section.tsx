import { useState } from 'react'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useHotkey } from '@tanstack/react-hotkeys'
import { KeyRound, Lock } from 'lucide-react'
import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut'
import { changePasswordSettingsFn } from './settings-auth'
import { refreshSettings, settingsQuery } from './settings-query'

const EMPTY_PASSWORDS = { currentPassword: '', newPassword: '' }

/**
 * Changes the account password, or sets a first one for accounts that only
 * sign in through an OAuth provider (no current password to ask for).
 */
export function PasswordSection() {
  const queryClient = useQueryClient()
  const { data: settings } = useSuspenseQuery(settingsQuery())
  const hasPassword = settings.methods.some(
    (method) => method.providerId === 'credential',
  )
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS)

  const changePassword = useMutation({
    mutationFn: () => changePasswordSettingsFn({ data: passwords }),
    onSuccess: () => {
      setPasswords(EMPTY_PASSWORDS)
      toast.success('Password updated.')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update password.',
      )
    },
    // Setting a first password links a new "credential" method.
    onSettled: () => refreshSettings(queryClient),
  })

  const canSubmit =
    !changePassword.isPending &&
    (!hasPassword || passwords.currentPassword.trim().length > 0) &&
    passwords.newPassword.trim().length > 0

  const submit = () => {
    if (canSubmit) changePassword.mutate()
  }

  useHotkey('Mod+Enter', submit, { enabled: canSubmit })

  return (
    <section className="overflow-hidden rounded-2xl bg-linear-to-br from-background via-background to-muted/30 p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
          <Lock className="text-primary size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Password</h2>
          <p className="text-muted-foreground text-sm">
            {hasPassword
              ? 'Change your account password'
              : 'Set a password to also sign in with your email'}
          </p>
        </div>
      </div>

      <div className="flex max-w-md flex-col gap-4">
        {hasPassword && (
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-sm font-medium">
              Current Password
            </Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={passwords.currentPassword}
              onChange={(event) =>
                setPasswords((prev) => ({
                  ...prev,
                  currentPassword: event.target.value,
                }))
              }
              placeholder="Enter current password"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-sm font-medium">
            New Password
          </Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={passwords.newPassword}
            onChange={(event) =>
              setPasswords((prev) => ({
                ...prev,
                newPassword: event.target.value,
              }))
            }
            placeholder="Enter new password"
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button disabled={!canSubmit} onClick={submit}>
            {changePassword.isPending ? (
              <>
                <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Updating...
              </>
            ) : (
              <>
                <KeyRound className="mr-2 size-4" />
                {hasPassword ? 'Change Password' : 'Set Password'}
                <KeyboardShortcut keys="Mod+Enter" className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  )
}
