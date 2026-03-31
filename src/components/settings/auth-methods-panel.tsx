import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { linkSocialProviderFn, unlinkAccountFn } from "@/lib/auth-methods";
import { runSettingsAction } from "@/components/settings/settings-utils";

type AccountItem = { providerId?: string };
type Props = {
  authMethods: string[];
  isBusy: boolean;
  setIsBusy: (value: boolean) => void;
  onRefresh: () => Promise<void>;
  accounts: AccountItem[];
};

export function AuthMethodsPanel({ authMethods, isBusy, setIsBusy, onRefresh, accounts }: Props) {
  const hasGithub = accounts.some((account) => account.providerId === "github");
  return (
    <section className="rounded-lg border p-4 space-y-3">
      <h2 className="font-medium">Authentication methods</h2>
      <div className="flex flex-wrap gap-2">{authMethods.map((method) => <Badge key={method}>{method}</Badge>)}</div>
      <div className="flex gap-2">
        <Button variant="outline" disabled={isBusy || hasGithub} onClick={() => void runSettingsAction(setIsBusy, onRefresh, async () => linkSocialProviderFn({ data: { provider: "github" } }), "Provider link started")}>
          Link GitHub
        </Button>
        <Button variant="outline" disabled={isBusy || !hasGithub} onClick={() => void runSettingsAction(setIsBusy, onRefresh, async () => unlinkAccountFn({ data: { provider: "github" } }), "GitHub unlinked")}>
          Unlink GitHub
        </Button>
      </div>
    </section>
  );
}
