import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const lookupSchema = z.object({
  barcode: z.string().trim().min(4).max(64),
  kind: z.enum(["book", "game", "music-film", "rare"]),
});

const publishSchema = z
  .object({
    intakeId: z.string().optional(),
    kind: z.enum(["book", "game", "music-film", "rare"]),
    barcode: z.string().max(64).optional(),
    candidate: z.unknown().optional(),
    title: z.string().trim().min(2).max(240),
    maker: z.string().trim().max(180),
    year: z
      .string()
      .regex(/^\d{4}$/)
      .or(z.literal("")),
    extra: z.string().trim().max(500),
    room: z.enum(["library", "arcade", "sound-vision", "curiosity"]),
    shelf: z.string().trim().min(2).max(100),
    condition: z.string().trim().min(2).max(80),
    price: z.string().regex(/^\d{1,5}(\.\d{1,2})?$/),
    note: z.string().trim().max(1000),
    included: z.string().trim().max(500),
    missing: z.string().trim().max(500),
    deliveryEligible: z.boolean(),
    clickCollectEligible: z.boolean(),
    photos: z.array(z.string()).max(6),
  })
  .refine((value) => value.deliveryEligible || value.clickCollectEligible, {
    message: "Choose delivery, click and collect, or both.",
  });

export const lookupBarcode = createServerFn({ method: "POST" })
  .validator(lookupSchema)
  .handler(async ({ data }) => {
    const { lookupBarcodeOnServer } = await import("./intake-impl.server");
    return lookupBarcodeOnServer(data);
  });

export const publishListing = createServerFn({ method: "POST" })
  .validator(publishSchema)
  .handler(async ({ data }) => {
    const { publishListingOnServer } = await import("./intake-impl.server");
    return publishListingOnServer(data);
  });

export const getStaffDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const { staffDashboardOnServer } = await import("./intake-impl.server");
  return staffDashboardOnServer();
});

export const getStaffInventory = createServerFn({ method: "GET" }).handler(async () => {
  const { staffInventoryOnServer } = await import("./intake-impl.server");
  return staffInventoryOnServer();
});
