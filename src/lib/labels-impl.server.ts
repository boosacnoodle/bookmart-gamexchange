import QRCode from "qrcode";

import { requireStaffOnServer } from "./auth-impl.server";
import { db } from "./db";

export async function productLabelOnServer(id: string) {
  await requireStaffOnServer();
  const product = await db.product.findUnique({
    where: { id },
    select: { id: true, title: true, sku: true, priceMinor: true, shelfLocation: true },
  });
  if (!product) throw new Error("That label no longer exists.");
  const qrDataUrl = await QRCode.toDataURL(product.sku, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 420,
    color: { dark: "#090909", light: "#ffffff" },
  });
  return { ...product, qrDataUrl };
}
