import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getAuthSettings, updateProfile, changePassword } from "@/lib/auth-methods-core";
import {
  disableTwoFactor,
  generateBackupCodes,
  getTotpUri,
  linkSocialProvider,
  revokeSession,
  unlinkAccount,
  verifyBackupCode,
  verifyTotp,
} from "@/lib/auth-methods-security";

const EmptySchema = z.object({});
const UpdateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  image: z.string().trim().url().optional().or(z.literal("")),
});
const PasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});
const TotpSchema = z.object({ password: z.string().min(1) });
const TotpVerifySchema = z.object({ code: z.string().trim().min(6) });
const BackupCodeSchema = z.object({ code: z.string().trim().min(1) });
const SocialLinkSchema = z.object({ provider: z.string().min(1) });
const SessionSchema = z.object({ token: z.string().min(1) });
const requestHeaders = () => getRequest().headers;

export const getAuthSettingsFn = createServerFn({ method: "GET" }).inputValidator(EmptySchema).handler(async () => getAuthSettings(requestHeaders()));
export const updateProfileFn = createServerFn({ method: "POST" }).inputValidator(UpdateProfileSchema).handler(async ({ data }) => updateProfile(requestHeaders(), data.name, data.image ?? ""));
export const changePasswordFn = createServerFn({ method: "POST" }).inputValidator(PasswordSchema).handler(async ({ data }) => changePassword(requestHeaders(), data.currentPassword, data.newPassword));
export const linkSocialProviderFn = createServerFn({ method: "POST" }).inputValidator(SocialLinkSchema).handler(async ({ data }) => linkSocialProvider(requestHeaders(), data.provider));
export const unlinkAccountFn = createServerFn({ method: "POST" }).inputValidator(SocialLinkSchema).handler(async ({ data }) => unlinkAccount(requestHeaders(), data.provider));
export const getTotpUriFn = createServerFn({ method: "POST" }).inputValidator(TotpSchema).handler(async ({ data }) => getTotpUri(requestHeaders(), data.password));
export const verifyTotpFn = createServerFn({ method: "POST" }).inputValidator(TotpVerifySchema).handler(async ({ data }) => verifyTotp(requestHeaders(), data.code));
export const disableTwoFactorFn = createServerFn({ method: "POST" }).inputValidator(TotpSchema).handler(async ({ data }) => disableTwoFactor(requestHeaders(), data.password));
export const generateBackupCodesFn = createServerFn({ method: "POST" }).inputValidator(TotpSchema).handler(async ({ data }) => generateBackupCodes(requestHeaders(), data.password));
export const verifyBackupCodeFn = createServerFn({ method: "POST" }).inputValidator(BackupCodeSchema).handler(async ({ data }) => verifyBackupCode(requestHeaders(), data.code));
export const revokeSessionFn = createServerFn({ method: "POST" }).inputValidator(SessionSchema).handler(async ({ data }) => revokeSession(requestHeaders(), data.token));
