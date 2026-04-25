'use client'

import { useMutation } from '@tanstack/react-query'
import { useHotkey } from '@tanstack/react-hotkeys'
import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Activity } from '@/components/ui/activity'
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut'
import { updateSettings, useSettingsStore } from '../-store'
import { updateProfileSettingsFn } from '../-settings-server'
import { useRef } from 'react'

export function ProfileSection( {
  initial,
}: {
  initial: { user: { name: string; image?: string | null } }
} ) {
  const name = useSettingsStore( ( state ) => state.name )
  const image = useSettingsStore( ( state ) => state.image )
  const isSavingProfile = useSettingsStore( ( state ) => state.isSavingProfile )
  const fileInputRef = useRef<HTMLInputElement>( null )
  const canSave = !isSavingProfile && name.trim().length > 0

  const getInitials = ( name: string ) => {
    return name
      .split( ' ' )
      .map( ( n ) => n[0] )
      .join( '' )
      .toUpperCase()
      .slice( 0, 2 )
  }

  const handleImageUpload = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    const file = e.target.files?.[0]
    if ( file ) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateSettings( { image: reader.result as string } )
      }
      reader.readAsDataURL( file )
    }
  }

  const saveProfileMutation = useMutation( {
    mutationFn: async () => {
      await updateProfileSettingsFn( { data: { name, image } } )
    },
    onMutate: () => {
      updateSettings( { isSavingProfile: true } )
    },
    onSuccess: () => {
      toast.success( 'Profile saved.' )
    },
    onError: ( error ) => {
      const previous = { name: initial.user.name, image: initial.user.image }
      updateSettings( { name: previous.name, image: previous.image ?? '' } )
      toast.error(
        error instanceof Error ? error.message : 'Failed to save profile.',
      )
    },
    onSettled: () => {
      updateSettings( { isSavingProfile: false } )
    },
  } )

  const saveProfile = () => {
    const previous = { name: initial.user.name, image: initial.user.image }
    if ( name.trim().length === 0 ) {
      updateSettings( { name: previous.name, image: previous.image ?? '' } )
      toast.error( 'Name is required.' )
      return
    }
    saveProfileMutation.mutate()
  }

  useHotkey(
    'Mod+Enter',
    () => {
      if ( canSave ) {
        saveProfile()
      }
    },
    { enabled: canSave },
  )

  return (
    <section className="overflow-hidden rounded-2xl bg-linear-to-br from-background via-background to-muted/30 p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Profile</h2>
      <p className="text-muted-foreground mb-6 text-sm">
        Manage your public profile information
      </p>

      <div className="flex flex-col gap-8">
        {/* Avatar Section */}
        <div className="flex items-start gap-6">
          <div className="relative">
            <Avatar className="size-24 ring-4 ring-background shadow-lg">
              <AvatarImage src={image || undefined} alt={name} />
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/40 text-lg font-semibold">
                {getInitials( name || 'User' )}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="secondary"
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-md"
              onClick={() => fileInputRef.current?.click()}
            >
              Change
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              aria-label="Upload profile image"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Full Name</Label>
              <Input
                value={name}
                onChange={( e ) => updateSettings( { name: e.target.value } )}
                placeholder="Enter your full name"
                className="max-w-md"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              This is your display name across the platform
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button disabled={!canSave} onClick={saveProfile} size="lg">
            <Activity
              when={isSavingProfile}
              fallback={
                <>
                  Save changes
                  <KeyboardShortcut keys="Mod+Enter" className="ml-2" />
                </>
              }
            >
              Saving...
            </Activity>
          </Button>
        </div>
      </div>
    </section>
  )
}
