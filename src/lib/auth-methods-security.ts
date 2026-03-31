import { auth } from "@/lib/auth";
import { requireSessionUserByHeaders } from "@/lib/auth-guard";

type RequestHeaders = Headers;
type ApiResult<T> = { data?: T | null; error?: { message?: string } | null };

function assertResult<T>(result: ApiResult<T>, fallback: string): T {
  if (!result.data) {
    throw new Error(result.error?.message ?? fallback);
  }
  return result.data;
}

export async function linkSocialProvider(headers: RequestHeaders, provider: string) {
  const result = await auth.api.linkSocialAccount({
    headers,
    body: { provider, callbackURL: "/settings" },
  });
  return assertResult(result as ApiResult<unknown>, "Failed to link provider");
}

export async function unlinkAccount(headers: RequestHeaders, provider: string) {
  const result = await auth.api.unlinkAccount({
    headers,
    body: { providerId: provider },
  });
  return assertResult(result as ApiResult<unknown>, "Failed to unlink provider");
}

export async function getTotpUri(headers: RequestHeaders, password: string) {
  const result = await auth.api.getTOTPURI({
    headers,
    body: { password },
  });
  return assertResult(result as ApiResult<{ totpURI: string }>, "Failed to create TOTP URI");
}

export async function verifyTotp(headers: RequestHeaders, code: string) {
  const result = await auth.api.verifyTOTP({
    headers,
    body: { code },
  });
  assertResult(result as ApiResult<unknown>, "Failed to verify TOTP");
}

export async function disableTwoFactor(headers: RequestHeaders, password: string) {
  const result = await auth.api.disableTwoFactor({
    headers,
    body: { password },
  });
  assertResult(result as ApiResult<unknown>, "Failed to disable two-factor");
}

export async function generateBackupCodes(headers: RequestHeaders, password: string) {
  const result = await auth.api.generateBackupCodes({
    headers,
    body: { password },
  });
  return assertResult(result as ApiResult<{ backupCodes: string[] }>, "Failed to generate backup codes");
}

export async function verifyBackupCode(headers: RequestHeaders, code: string) {
  const result = await auth.api.verifyBackupCode({
    headers,
    body: { code },
  });
  assertResult(result as ApiResult<unknown>, "Failed to verify backup code");
}

export async function revokeSession(headers: RequestHeaders, token: string) {
  const user = await requireSessionUserByHeaders(headers);
  const sessionsRes = await auth.api.listSessions({ headers });
  const sessions = (sessionsRes as ApiResult<Array<{ token?: string; userId?: string }>>).data ?? [];
  const owned = sessions.some((sessionItem) => sessionItem.token === token && sessionItem.userId === user.id);
  if (!owned) throw new Error("Session not found");
  const result = await auth.api.revokeSession({ headers, body: { token } });
  assertResult(result as ApiResult<unknown>, "Failed to revoke session");
}
