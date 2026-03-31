"use client";

import { createClientOnlyFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { revokeSessionFn } from "@/lib/auth-methods";
import { runSettingsAction } from "@/components/settings/settings-utils";
import { authClient } from "@/lib/auth-client";

type SessionItem = { token: string; userAgent?: string | null; ipAddress?: string | null };
type Props = {
  sessions: SessionItem[];
  isBusy: boolean;
  setIsBusy: (value: boolean) => void;
  onRefresh: () => Promise<void>;
};

const signOutClient = createClientOnlyFn(async () => authClient.signOut());

export function SessionsPanel({ sessions, isBusy, setIsBusy, onRefresh }: Props) {
  return (
    <section className="rounded-lg border p-4 space-y-3">
      <h2 className="font-medium">Active sessions</h2>
      {sessions.map((sessionItem) => (
        <div key={sessionItem.token} className="flex items-center justify-between rounded border p-2">
          <span className="text-xs">{sessionItem.userAgent ?? "Unknown"} · {sessionItem.ipAddress ?? "Unknown IP"}</span>
          <Button variant="destructive" size="sm" disabled={isBusy} onClick={() => void runSettingsAction(setIsBusy, onRefresh, async () => revokeSessionFn({ data: { token: sessionItem.token } }), "Session revoked")}>
            Revoke
          </Button>
        </div>
      ))}
      <Button variant="outline" onClick={() => void signOutClient().then(() => window.location.reload())}>Sign out current session</Button>
    </section>
  );
}
