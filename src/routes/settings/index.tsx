import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/settings/settings-page";
import { requireAuthBeforeLoad } from "@/lib/auth-route-guards";

export const Route = createFileRoute("/settings/")({
  beforeLoad: requireAuthBeforeLoad,
  component: SettingsPage,
});
