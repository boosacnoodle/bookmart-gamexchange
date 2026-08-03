import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = [
  { prefix: "/staff", roles: ["STAFF", "ADMIN"] },
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/account", roles: ["CUSTOMER", "STAFF", "ADMIN"], allow: ["/account/login", "/account/reset-password", "/account/forgot-password", "/account/unauthorized"] }
];

async function verifyCookie(value: string | undefined) {
  if (!value) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;
  const secret = process.env.NEXTAUTH_SECRET || "local-dev-bookmart-secret-change-before-production";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encoded));
  const expected = Buffer.from(signed).toString("base64url");
  if (expected !== signature) return null;
  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as { role: string; exp: number };
  if (payload.exp < Date.now()) return null;
  return payload;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const policy = protectedPrefixes.find((item) => path.startsWith(item.prefix));
  if (!policy || policy.allow?.includes(path)) return NextResponse.next();

  const payload = await verifyCookie(request.cookies.get("bookmart_session")?.value);
  if (!payload) {
    const url = new URL("/account/login", request.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  if (!policy.roles.includes(payload.role)) return NextResponse.redirect(new URL("/account/unauthorized", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*", "/admin/:path*", "/account/:path*"]
};
