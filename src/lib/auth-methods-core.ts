import { auth } from "@/lib/auth";
import { requireSessionUser } from "@/lib/auth-guard";

type RequestHeaders = Headers;
type ApiResult<T> = { data?: T | null; error?: { message?: string } | null };

function assertResult<T>(result: ApiResult<T>, fallback: string): T {
  if (!result.data) {
    throw new Error(result.error?.message ?? fallback);
  }
  return result.data;
}

export async function getAuthSettings(headers: RequestHeaders) {
  const user = await requireSessionUser(new Request("http://local", { headers }));
  const [accountsRes, sessionsRes] = await Promise.all([
    auth.api.listUserAccounts({ headers }),
    auth.api.listSessions({ headers }),
  ]);

  return {
    user,
    accounts: (accountsRes as ApiResult<unknown[]>).data ?? [],
    sessions: (sessionsRes as ApiResult<unknown[]>).data ?? [],
  };
}

export async function updateProfile(headers: RequestHeaders, name: string, image: string) {
  const result = await auth.api.updateUser({
    headers,
    body: { name, image: image.length ? image : undefined },
  });
  return assertResult(result as ApiResult<unknown>, "Failed to update profile");
}

export async function changePassword(headers: RequestHeaders, currentPassword: string, newPassword: string) {
  const result = await auth.api.changePassword({
    headers,
    body: { currentPassword, newPassword, revokeOtherSessions: false },
  });
  assertResult(result as ApiResult<unknown>, "Failed to change password");
}
