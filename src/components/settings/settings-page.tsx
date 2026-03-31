import { useEffect, useMemo, useState } from "react";
import {
  getAuthSettingsFn,
} from "@/lib/auth-methods";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { ProfilePanel } from "@/components/settings/profile-panel";
import { AuthMethodsPanel } from "@/components/settings/auth-methods-panel";
import { SecurityPanel } from "@/components/settings/security-panel";
import { PasswordPanel } from "@/components/settings/password-panel";
import { SessionsPanel } from "@/components/settings/sessions-panel";

type SettingsState = Awaited<ReturnType<typeof getAuthSettingsFn>>;

export function SettingsPage() {
  const [state, setState] = useState<SettingsState | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const authMethods = useMemo(() => {
    if (!state) return [];
    const providerMethods = state.accounts
      .map((account: { providerId?: string }) => account.providerId)
      .filter((providerId): providerId is string => providerId !== undefined);
    const twoFactorMethod = state.user.twoFactorEnabled ? ["totp-2fa"] : [];
    return [...new Set([...providerMethods, ...twoFactorMethod])];
  }, [state]);

  const refresh = async () => {
    const next = await getAuthSettingsFn({ data: {} });
    setState(next);
    setName(next.user.name);
    setImage(next.user.image ?? "");
  };

  useEffect(() => {
    void refresh().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to load settings";
      toast.error(message);
    });
  }, []);

  if (!state) {
    return <div className="p-6 text-sm text-muted-foreground">Loading settings…</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <section className="rounded-lg border p-4">
        <h1 className="text-lg font-semibold">Account settings</h1>
        <p className="text-sm text-muted-foreground">Role: <Badge>{state.user.role ?? "user"}</Badge></p>
      </section>
      <ProfilePanel name={name} image={image} setName={setName} setImage={setImage} isBusy={isBusy} setIsBusy={setIsBusy} onRefresh={refresh} />
      <AuthMethodsPanel authMethods={authMethods} isBusy={isBusy} setIsBusy={setIsBusy} onRefresh={refresh} accounts={state.accounts as Array<{ providerId?: string }>} />
      <SecurityPanel isBusy={isBusy} setIsBusy={setIsBusy} onRefresh={refresh} />
      <PasswordPanel currentPassword={currentPassword} newPassword={newPassword} setCurrentPassword={setCurrentPassword} setNewPassword={setNewPassword} isBusy={isBusy} setIsBusy={setIsBusy} onRefresh={refresh} />
      <SessionsPanel sessions={state.sessions as Array<{ token: string; userAgent?: string | null; ipAddress?: string | null }>} isBusy={isBusy} setIsBusy={setIsBusy} onRefresh={refresh} />
    </div>
  );
}
