import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, User } from "@prisma/client";
import { db } from "./db";
import { verifySignedSessionCookie } from "./session-token";

export const authCookieName = "bookmart_session";

export type AuthUser = Pick<User, "id" | "email" | "name" | "role">;

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const payload = verifySignedSessionCookie(cookieStore.get(authCookieName)?.value);
  if (!payload) return null;
  const session = await db.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true }
  });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role
  };
}

export async function requireUser(roles?: Role[], nextPath = "/staff") {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/login?next=${encodeURIComponent(nextPath)}`);
  if (roles && !roles.includes(user.role)) redirect("/account/unauthorized");
  return user;
}

export function canAccessStaff(role: Role) {
  return role === "STAFF" || role === "ADMIN";
}
