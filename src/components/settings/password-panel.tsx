"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { changePasswordFn } from "@/lib/auth-methods";
import { runSettingsAction } from "@/components/settings/settings-utils";

type Props = {
  currentPassword: string;
  newPassword: string;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  isBusy: boolean;
  setIsBusy: (value: boolean) => void;
  onRefresh: () => Promise<void>;
};

export function PasswordPanel({ currentPassword, newPassword, setCurrentPassword, setNewPassword, isBusy, setIsBusy, onRefresh }: Props) {
  return (
    <section className="rounded-lg border p-4 space-y-3">
      <h2 className="font-medium">Password</h2>
      <Input placeholder="Current password" value={currentPassword} type="password" onChange={(event) => setCurrentPassword(event.target.value)} />
      <Input placeholder="New password" value={newPassword} type="password" onChange={(event) => setNewPassword(event.target.value)} />
      <Button disabled={isBusy} onClick={() => void runSettingsAction(setIsBusy, onRefresh, async () => changePasswordFn({ data: { currentPassword, newPassword } }), "Password updated")}>
        Change password
      </Button>
    </section>
  );
}
