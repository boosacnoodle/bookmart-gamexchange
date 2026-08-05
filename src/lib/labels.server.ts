import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getProductLabel = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1).max(64) }))
  .handler(async ({ data }) => {
    const { productLabelOnServer } = await import("./labels-impl.server");
    return productLabelOnServer(data.id);
  });
