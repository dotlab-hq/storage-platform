import { useRef, useState } from 'react'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useHotkey } from '@tanstack/react-hotkeys'
import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut'
import { CURRENT_USER_QUERY_KEY } from '@/lib/auth/current-user'
import { updateProfileSettingsFn } from './settings-auth'
import { refreshSettings, settingsQuery } from './settings-query'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Edits the display name and avatar. */
export function ProfileSection() {
  const queryClient = useQueryClient()
  const { data: settings } = useSuspenseQuery(settingsQuery())
  const [name, setName] = useState(() => settings.user.name ?? '')
  const [image, setImage] = useState(() => settings.user.image)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const saveProfile = useMutation({
    mutationFn: () => updateProfileSettingsFn({ data: { name, image } }),
    onSuccess: () => {
      toast.success('Profile saved.')
    },
    onError: (error) => {
      setName(settings.user.name ?? '')
      setImage(settings.user.image)
      toast.error(
        error instanceof Error ? error.message : 'Failed to save profile.',
      )
    },
    // The sidebar shows the name from the current-user query.
    onSettled: () =>
      Promise.all([
        refreshSettings(queryClient),
        queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY }),
      ]),
  })

  const canSave = !saveProfile.isPending && name.trim().length > 0

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const submit = () => {
    if (canSave) saveProfile.mutate()
  }

  useHotkey('Mod+Enter', submit, { enabled: canSave })

  return (
    <section className="overflow-hidden rounded-2xl bg-linear-to-br from-background via-background to-muted/30 p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Profile</h2>
      <p className="text-muted-foreground mb-6 text-sm">
        Manage your public profile information
      </p>

      <div className="flex flex-col gap-8">
        <div className="flex items-start gap-6">
          <div className="relative">
            <Avatar className="size-24 ring-4 ring-background shadow-lg">
              <AvatarImage src={image || undefined} alt={name} />
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/40 text-lg font-semibold">
                {getInitials(name || 'User')}
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
              <Label htmlFor="profile-name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
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
          <Button disabled={!canSave} onClick={submit} size="lg">
            {saveProfile.isPending ? (
              'Saving...'
            ) : (
              <>
                Save changes
                <KeyboardShortcut keys="Mod+Enter" className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  )
}
