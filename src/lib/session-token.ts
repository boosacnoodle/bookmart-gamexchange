import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { Role } from "@prisma/client";

export type SessionPayload = {
  sessionId: string;
  userId: string;
  role: Role;
  exp: number;
};

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must be configured with at least 32 characters.");
  }
  return value;
}

function base64url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function makeRawToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHmac("sha256", secret()).update(token).digest("hex");
}

export function createSignedSessionCookie(payload: SessionPayload) {
  const encoded = base64url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

export function verifySignedSessionCookie(cookie: string | undefined): SessionPayload | null {
  if (!cookie) return null;
  const [encoded, signature] = cookie.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const supplied = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (supplied.length !== wanted.length || !timingSafeEqual(supplied, wanted)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}
