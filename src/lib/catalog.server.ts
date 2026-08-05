import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const roomSchema = z.enum(["library", "arcade", "sound-vision", "curiosity"]);

export const getRoomInventory = createServerFn({ method: "GET" })
  .validator(z.object({ room: roomSchema }))
  .handler(async ({ data }) => {
    const { roomInventoryOnServer } = await import("./catalog-impl.server");
    return roomInventoryOnServer(data.room);
  });

export const getPublicProduct = createServerFn({ method: "GET" })
  .validator(z.object({ room: roomSchema, slug: z.string().min(1).max(140) }))
  .handler(async ({ data }) => {
    const { publicProductOnServer } = await import("./catalog-impl.server");
    return publicProductOnServer(data.room, data.slug);
  });

export const searchInventory = createServerFn({ method: "GET" })
  .validator(z.object({ query: z.string().max(120) }))
  .handler(async ({ data }) => {
    const { searchInventoryOnServer } = await import("./catalog-impl.server");
    return searchInventoryOnServer(data.query);
  });
