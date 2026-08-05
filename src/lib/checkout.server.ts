import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const keysSchema = z.object({ keys: z.array(z.string().min(1).max(160)).min(1).max(30) });

export const getCheckoutItems = createServerFn({ method: "POST" })
  .validator(keysSchema)
  .handler(async ({ data }) => {
    const { checkoutItemsOnServer } = await import("./checkout-impl.server");
    return checkoutItemsOnServer(data.keys);
  });

export const beginCheckout = createServerFn({ method: "POST" })
  .validator(
    keysSchema.extend({
      customerName: z.string().trim().min(2).max(120),
      customerEmail: z.string().trim().email().max(180),
      customerPhone: z.string().trim().max(40).optional(),
      deliveryMethod: z.enum(["collect", "ship-ie"]),
      line1: z.string().trim().max(180).optional(),
      line2: z.string().trim().max(180).optional(),
      city: z.string().trim().max(100).optional(),
      postcode: z.string().trim().max(30).optional(),
      notes: z.string().trim().max(1000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { beginCheckoutOnServer } = await import("./checkout-impl.server");
    return beginCheckoutOnServer(data);
  });

export const getOrderConfirmation = createServerFn({ method: "GET" })
  .validator(z.object({ orderNumber: z.string().min(1).max(80), adapter: z.boolean().optional() }))
  .handler(async ({ data }) => {
    const { orderConfirmationOnServer } = await import("./checkout-impl.server");
    return orderConfirmationOnServer(data.orderNumber, data.adapter ?? false);
  });
