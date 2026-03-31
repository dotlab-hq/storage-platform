"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { runSettingsAction } from "@/components/settings/settings-utils";
import { authClient } from "@/lib/auth-client";
import { disableTwoFactorFn, generateBackupCodesFn, getTotpUriFn, verifyBackupCodeFn, verifyTotpFn } from "@/lib/auth-methods";

type Props = {
  isBusy: boolean;
  setIsBusy: (value: boolean) => void;
  onRefresh: () => Promise<void>;
};

export function SecurityPanel({ isBusy, setIsBusy, onRefresh }: Props) {
  const [totpPassword, setTotpPassword] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [passkeys, setPasskeys] = useState<Array<{ id: string; name?: string | null }>>([]);

  const refreshPasskeys = async () => {
    const passkeysRes = await authClient.passkey.listUserPasskeys();
    setPasskeys((passkeysRes.data ?? []) as Array<{ id: string; name?: string | null }>);
  };

  useEffect(() => {
    void refreshPasskeys();
  }, []);

  return (
    <section className="rounded-lg border p-4 space-y-3">
      <h2 className="font-medium">Passkeys & 2FA</h2>
      <Button disabled={isBusy} onClick={() => void runSettingsAction(setIsBusy, onRefresh, async () => {
        await authClient.passkey.add({ name: "Security key" });
        await refreshPasskeys();
      }, "Passkey added")}>
        Add passkey
      </Button>
      <div className="space-y-2">
        {passkeys.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded border p-2">
            <span className="text-sm">{item.name ?? "Security key"}</span>
            <Button variant="destructive" size="sm" disabled={isBusy} onClick={() => void runSettingsAction(setIsBusy, onRefresh, async () => {
              await authClient.passkey.delete({ id: item.id });
              await refreshPasskeys();
            }, "Passkey removed")}>
              Remove
            </Button>
          </div>
        ))}
      </div>
      <Input placeholder="Password for 2FA actions" value={totpPassword} onChange={(event) => setTotpPassword(event.target.value)} type="password" />
      <div className="flex gap-2">
        <Button disabled={isBusy} onClick={() => void runSettingsAction(setIsBusy, onRefresh, async () => {
          const result = await getTotpUriFn({ data: { password: totpPassword } });
          setTotpUri(result.totpURI);
        }, "TOTP URI generated")}>Generate TOTP URI</Button>
        <Button variant="outline" disabled={isBusy} onClick={() => void runSettingsAction(setIsBusy, onRefresh, async () => disableTwoFactorFn({ data: { password: totpPassword } }), "Two-factor disabled")}>Disable 2FA</Button>
      </div>
      {totpUri ? <p className="text-xs break-all">{totpUri}</p> : null}
      <Input placeholder="Verification code" value={totpCode} onChange={(event) => setTotpCode(event.target.value)} />
      <Button disabled={isBusy} onClick={() => void runSettingsAction(setIsBusy, onRefresh, async () => verifyTotpFn({ data: { code: totpCode } }), "Two-factor verified")}>Verify TOTP</Button>
      <Button variant="outline" disabled={isBusy} onClick={() => void runSettingsAction(setIsBusy, onRefresh, async () => generateBackupCodesFn({ data: { password: totpPassword } }), "Backup codes generated")}>Generate backup codes</Button>
      <Input placeholder="Backup code" value={backupCode} onChange={(event) => setBackupCode(event.target.value)} />
      <Button variant="outline" disabled={isBusy} onClick={() => void runSettingsAction(setIsBusy, onRefresh, async () => verifyBackupCodeFn({ data: { code: backupCode } }), "Backup code verified")}>Verify backup code</Button>
    </section>
  );
}
