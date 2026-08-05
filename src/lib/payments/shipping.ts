import type { Product } from "@prisma/client";
import { db } from "@/lib/db";

export type DeliverySelection = "ship-ie" | "collect";

export type ShippingQuote = {
  method: DeliverySelection;
  label: string;
  costMinor: number;
  available: boolean;
  reason?: string;
  instructions?: string;
};

async function setting(key: string, fallback: string) {
  const found = await db.siteSetting.findUnique({ where: { key } });
  return found?.value ?? fallback;
}

export async function quoteShipping(
  products: Pick<Product, "collectionOnly" | "priceMinor" | "category">[],
  method: DeliverySelection,
): Promise<ShippingQuote> {
  const instructions = await setting(
    "collection.instructions",
    "Bring your order number to 73 Talbot Street, Dublin 1.",
  );
  if (method === "collect") {
    return { method, label: "Click and collect", costMinor: 0, available: true, instructions };
  }

  if (products.some((product) => product.collectionOnly)) {
    return {
      method,
      label: "Ireland shipping",
      costMinor: 0,
      available: false,
      reason: "One or more items are collection-only.",
    };
  }

  const allowedCountries = await setting("shipping.allowed.countries", "IE");
  if (
    !allowedCountries
      .split(",")
      .map((item) => item.trim())
      .includes("IE")
  ) {
    return {
      method,
      label: "Ireland shipping",
      costMinor: 0,
      available: false,
      reason: "Ireland shipping is not enabled.",
    };
  }

  const subtotal = products.reduce((sum, product) => sum + product.priceMinor, 0);
  const threshold = Number(await setting("shipping.free.threshold", "7500"));
  const flatRate = Number(await setting("shipping.standard.minor", "595"));
  return {
    method,
    label:
      subtotal >= threshold
        ? "Ireland shipping - free over threshold"
        : "Ireland standard shipping",
    costMinor: subtotal >= threshold ? 0 : flatRate,
    available: true,
  };
}
