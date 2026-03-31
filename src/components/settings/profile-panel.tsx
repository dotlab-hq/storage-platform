"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateProfileFn } from "@/lib/auth-methods";
import { runSettingsAction } from "@/components/settings/settings-utils";

type Props = {
  name: string;
  image: string;
  setName: (value: string) => void;
  setImage: (value: string) => void;
  isBusy: boolean;
  setIsBusy: (value: boolean) => void;
  onRefresh: () => Promise<void>;
};

export function ProfilePanel({ name, image, setName, setImage, isBusy, setIsBusy, onRefresh }: Props) {
  return (
    <section className="rounded-lg border p-4 space-y-3">
      <h2 className="font-medium">Profile</h2>
      <Label>Name</Label>
      <Input value={name} onChange={(event) => setName(event.target.value)} />
      <Label>Avatar URL</Label>
      <Input value={image} onChange={(event) => setImage(event.target.value)} />
      <Button disabled={isBusy} onClick={() => void runSettingsAction(setIsBusy, onRefresh, async () => updateProfileFn({ data: { name, image } }), "Profile updated")}>
        Save profile
      </Button>
    </section>
  );
}
