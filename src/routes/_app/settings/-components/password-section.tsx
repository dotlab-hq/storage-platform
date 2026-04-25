'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useHotkey } from '@tanstack/react-hotkeys'
import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Activity } from '@/components/ui/activity'
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut'
import { KeyRound, Lock } from 'lucide-react'
import { updateSettings, useSettingsStore } from '../-store'
import { changePasswordSettingsFn } from '../-settings-server'

export function PasswordSection() {
  const [passwords, setPasswords] = useState( {
    currentPassword: '',
    newPassword: '',
  } )
  const isChangingPassword = useSettingsStore(
    ( state ) => state.isChangingPassword,
  )

  const canSubmit =
    !isChangingPassword &&
    passwords.currentPassword.trim().length > 0 &&
    passwords.newPassword.trim().length > 0

  const changePasswordMutation = useMutation( {
    mutationFn: async () => {
      await changePasswordSettingsFn( { data: passwords } )
    },
    onMutate: () => {
      updateSettings( { isChangingPassword: true } )
    },
    onSuccess: () => {
      setPasswords( { currentPassword: '', newPassword: '' } )
      toast.success( 'Password updated.' )
    },
    onError: ( error ) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update password.',
      )
    },
    onSettled: () => {
      updateSettings( { isChangingPassword: false } )
    },
  } )

  useHotkey(
    'Mod+Enter',
    () => {
      if ( canSubmit ) {
        changePasswordMutation.mutate()
      }
    },
    { enabled: canSubmit },
  )

  return (
    <section className="overflow-hidden rounded-2xl bg-linear-to-br from-background via-background to-muted/30 p-6 shadow-sm">
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
            onChange={( e ) =>
              setPasswords( ( prev ) => ( {
                ...prev,
                currentPassword: e.target.value,
              } ) )
            }
            placeholder="Enter current password"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">New Password</Label>
          <Input
            type="password"
            value={passwords.newPassword}
            onChange={( e ) =>
              setPasswords( ( prev ) => ( {
                ...prev,
                newPassword: e.target.value,
              } ) )
            }
            placeholder="Enter new password"
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button
            disabled={!canSubmit}
            onClick={() => changePasswordMutation.mutate()}
          >
            <Activity
              when={isChangingPassword}
              fallback={
                <>
                  <KeyRound className="mr-2 size-4" />
                  Change Password
                  <KeyboardShortcut keys="Mod+Enter" className="ml-2" />
                </>
              }
            >
              <>
                <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Updating...
              </>
            </Activity>
          </Button>
        </div>
      </div>
    </section>
  )
}
