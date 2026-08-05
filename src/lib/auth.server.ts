import { createServerFn } from "@tanstack/react-start";
import type { Role } from "@prisma/client";
import { z } from "zod";

export type AuthUser = { id: string; email: string; name: string; role: Role };

const loginSchema = z.object({
  name: z.string().trim().min(2).max(80),
  password: z.string().min(4).max(128),
});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const { currentUserOnServer } = await import("./auth-impl.server");
  return currentUserOnServer();
});

export const loginStaff = createServerFn({ method: "POST" })
  .validator(loginSchema)
  .handler(async ({ data }) => {
    const { loginStaffOnServer } = await import("./auth-impl.server");
    return loginStaffOnServer(data);
  });

export const logoutStaff = createServerFn({ method: "POST" }).handler(async () => {
  const { logoutStaffOnServer } = await import("./auth-impl.server");
  return logoutStaffOnServer();
});
