import { auth } from "@/lib/auth";

type SessionUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role?: string | null;
  twoFactorEnabled?: boolean;
};

export async function requireSessionUser(request: Request): Promise<SessionUser> {
  return requireSessionUserByHeaders(request.headers);
}

export async function requireSessionUserByHeaders(headers: Headers): Promise<SessionUser> {
  const session = await auth.api.getSession({
    headers,
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user as SessionUser;
}

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin";
}

export function getAuthAwareStatus(error: unknown): number {
  if (error instanceof Error && error.message === "Unauthorized") {
    return 401;
  }
  return 500;
}
