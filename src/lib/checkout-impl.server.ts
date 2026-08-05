import { db } from "./db";
import { stripeRuntimeStatus } from "./payments/config";
import { createCheckout, markOrderPaidByCheckoutSession } from "./payments/orders";

async function productsForKeys(keys: string[]) {
  return db.product.findMany({
    where: {
      OR: [{ id: { in: keys } }, { slug: { in: keys } }],
      inventoryState: "PUBLISHED",
      quantity: { gt: 0 },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function checkoutItemsOnServer(keys: string[]) {
  const products = await productsForKeys(keys);
  return products.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    maker: item.creator || item.publisher || "Bookmart",
    priceMinor: item.priceMinor,
    imageUrl: item.imageUrl,
    shelf: item.shelfLocation,
    room: item.subcategory,
    condition: item.conditionReport,
    collectionOnly: item.collectionOnly,
    deliveryEligible: item.deliveryEligible,
    clickCollectEligible: item.clickCollectEligible,
    publishedAt: (item.publishedAt ?? item.createdAt).toISOString(),
  }));
}

export async function beginCheckoutOnServer(data: {
  keys: string[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryMethod: "collect" | "ship-ie";
  line1?: string;
  line2?: string;
  city?: string;
  postcode?: string;
  notes?: string;
}) {
  const products = await productsForKeys(data.keys);
  if (products.length !== data.keys.length)
    throw new Error(
      "One of these items is no longer available. Return to your basket and refresh it.",
    );
  if (
    data.deliveryMethod === "ship-ie" &&
    products.some((product) => product.collectionOnly || !product.deliveryEligible)
  ) {
    throw new Error(
      "One of these items is collection only. Choose click and collect or remove it from the basket.",
    );
  }
  if (
    data.deliveryMethod === "collect" &&
    products.some((product) => !product.clickCollectEligible)
  ) {
    throw new Error(
      "One of these items is delivery only. Choose delivery or remove it from the basket.",
    );
  }
  if (data.deliveryMethod === "ship-ie" && (!data.line1 || !data.city))
    throw new Error("Enter the delivery address and town or city.");
  const checkout = await createCheckout({
    basket: products.map((item) => ({ slug: item.slug, quantity: 1, priceMinor: item.priceMinor })),
    customerEmail: data.customerEmail,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    deliveryMethod: data.deliveryMethod,
    address: {
      line1: data.line1,
      line2: data.line2,
      city: data.city,
      postcode: data.postcode,
      country: "IE",
    },
    notes: data.notes,
  });
  return { checkoutUrl: checkout.checkoutUrl };
}

export async function orderConfirmationOnServer(orderNumber: string, adapter: boolean) {
  let order = await db.order.findUnique({ where: { orderNumber }, include: { items: true } });
  if (
    order &&
    adapter &&
    stripeRuntimeStatus().testAdapter &&
    order.stripeSessionId &&
    order.paymentStatus !== "PAID"
  ) {
    await markOrderPaidByCheckoutSession(order.stripeSessionId, order.stripePaymentIntentId);
    order = await db.order.findUnique({ where: { orderNumber }, include: { items: true } });
  }
  if (!order) return null;
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    deliveryMethod: order.deliveryMethod,
    totalMinor: order.totalMinor,
    items: order.items.map((item) => ({
      id: item.id,
      title: item.title,
      sku: item.skuSnapshot,
      priceMinor: item.priceMinor,
    })),
  };
}
