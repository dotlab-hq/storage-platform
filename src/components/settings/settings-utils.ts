import { toast } from "@/components/ui/sonner";

export async function runSettingsAction(
  setIsBusy: (value: boolean) => void,
  onRefresh: () => Promise<void>,
  action: () => Promise<unknown>,
  successMessage: string,
) {
  setIsBusy(true);
  try {
    await action();
    await onRefresh();
    toast.success(successMessage);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    toast.error(message);
  } finally {
    setIsBusy(false);
  }
}
