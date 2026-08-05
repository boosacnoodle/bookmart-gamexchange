import { deleteCookie, getCookie, getRequestIP, setCookie } from "@tanstack/react-start/server";

import { db } from "./db";
import { verifyPassword } from "./password";
import {
  createSignedSessionCookie,
  hashToken,
  makeRawToken,
  verifySignedSessionCookie,
} from "./session-token";
import type { AuthUser } from "./auth.server";

export const authCookieName = "bookmart_session";
const sessionDays = 7;
const attempts = new Map<string, { count: number; resetAt: number }>();

function assertLoginRate() {
  const ip = getRequestIP({ xForwardedFor: true }) || "unknown";
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || current.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 10 * 60_000 });
    return;
  }
  if (current.count >= 8) throw new Error("Too many attempts. Wait ten minutes and try again.");
  current.count += 1;
}

export async function currentUserOnServer(): Promise<AuthUser | null> {
  const payload = verifySignedSessionCookie(getCookie(authCookieName));
  if (!payload) return null;
  const session = await db.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };
}

export async function requireStaffOnServer() {
  const user = await currentUserOnServer();
  if (!user || (user.role !== "STAFF" && user.role !== "ADMIN")) {
    throw new Error("STAFF_AUTH_REQUIRED");
  }
  return user;
}

export async function requireAdminOnServer() {
  const user = await currentUserOnServer();
  if (!user || user.role !== "ADMIN") throw new Error("ADMIN_AUTH_REQUIRED");
  return user;
}

export async function loginStaffOnServer(data: { name: string; password: string }) {
  assertLoginRate();
  const candidates = await db.user.findMany({
    where: {
      name: { equals: data.name, mode: "insensitive" },
      role: { in: ["STAFF", "ADMIN"] },
    },
    take: 2,
  });
  const user = candidates.length === 1 ? candidates[0] : null;
  if (!user || !verifyPassword(data.password, user.passwordHash)) {
    return { ok: false as const, message: "That name or shop code is not recognised." };
  }

  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60_000);
  const rawToken = makeRawToken();
  const session = await db.session.create({
    data: { userId: user.id, tokenHash: hashToken(rawToken), expiresAt },
  });
  const signed = createSignedSessionCookie({
    sessionId: session.id,
    userId: user.id,
    role: user.role,
    exp: expiresAt.getTime(),
  });
  setCookie(authCookieName, signed, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDays * 24 * 60 * 60,
  });
  return { ok: true as const, user: { name: user.name, role: user.role } };
}

export async function logoutStaffOnServer() {
  const payload = verifySignedSessionCookie(getCookie(authCookieName));
  if (payload) await db.session.deleteMany({ where: { id: payload.sessionId } });
  deleteCookie(authCookieName, { path: "/" });
  return { ok: true as const };
}
