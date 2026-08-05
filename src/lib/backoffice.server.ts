import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getBackofficeStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { backofficeStatusOnServer } = await import("./backoffice-impl.server");
  return backofficeStatusOnServer();
});

export const getStaffOrders = createServerFn({ method: "GET" }).handler(async () => {
  const { staffOrdersOnServer } = await import("./backoffice-impl.server");
  return staffOrdersOnServer();
});

export const updateStaffOrder = createServerFn({ method: "POST" })
  .validator(
    z.object({
      orderId: z.string().min(1),
      action: z.enum(["processing", "ready", "shipped", "completed"]),
    }),
  )
  .handler(async ({ data }) => {
    const { updateStaffOrderOnServer } = await import("./backoffice-impl.server");
    return updateStaffOrderOnServer(data);
  });
