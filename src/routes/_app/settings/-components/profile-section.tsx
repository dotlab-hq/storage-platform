import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfileSettingsFn } from '../-settings-server'
import { updateSettings, useSettingsStore } from '../-store'

export function ProfileSection({
  initial,
}: {
  initial: { user: { name: string; image?: string | null } }
}) {
  const name = useSettingsStore((state) => state.name)
  const image = useSettingsStore((state) => state.image)
  const isSavingProfile = useSettingsStore((state) => state.isSavingProfile)

  const saveProfile = async () => {
    const previous = { name: initial.user.name, image: initial.user.image }
    updateSettings({ isSavingProfile: true })
    try {
      await updateProfileSettingsFn({ data: { name, image } })
      toast.success('Profile saved.')
    } catch (error) {
      updateSettings({ name: previous.name, image: previous.image ?? '' })
      toast.error(
        error instanceof Error ? error.message : 'Failed to save profile.',
      )
    } finally {
      updateSettings({ isSavingProfile: false })
    }
  }

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <h2 className="text-base font-semibold">Profile</h2>
      <div className="space-y-1">
        <Label>Name</Label>
        <Input
          value={name}
          onChange={(e) => updateSettings({ name: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label>Avatar URL</Label>
        <Input
          value={image}
          onChange={(e) => updateSettings({ image: e.target.value })}
        />
      </div>
      <Button disabled={isSavingProfile} onClick={() => void saveProfile()}>
        {isSavingProfile ? 'Saving...' : 'Save profile'}
      </Button>
    </section>
  )
}
