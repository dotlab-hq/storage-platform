import { redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export async function requireAuthBeforeLoad() {
  const { data } = await authClient.getSession();
  if (!data?.user) {
    throw redirect({ to: "/auth" });
  }
}
