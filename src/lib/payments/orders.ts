import "server-only";
import { Prisma, type DeliveryMethod, type Product } from "@prisma/client";
import { db } from "@/lib/db";
import { quoteShipping, type DeliverySelection } from "./shipping";
import { createCheckoutSession } from "./stripe";
import { sendOrderEmail } from "./email";

export type BasketLineInput = {
  slug: string;
  quantity: number;
  priceMinor?: number;
};

export type CheckoutInput = {
  basket: BasketLineInput[];
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  deliveryMethod: DeliverySelection;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
  notes?: string;
  userId?: string;
};

export class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutError";
  }
}

const reservationMinutes = 30;

function orderNumber() {
  return `BMGX-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;
}

export async function expireReservations(now = new Date()) {
  const expired = await db.inventoryReservation.findMany({
    where: { state: "ACTIVE", expiresAt: { lt: now } },
    include: { product: true }
  });
  for (const reservation of expired) {
    await db.$transaction([
      db.inventoryReservation.update({ where: { id: reservation.id }, data: { state: "EXPIRED", cancelledAt: now } }),
      db.product.updateMany({ where: { id: reservation.productId, inventoryState: "RESERVED" }, data: { inventoryState: "PUBLISHED" } })
    ]);
  }
  return expired.length;
}

function validateBasketLines(lines: BasketLineInput[]) {
  if (!lines.length) throw new CheckoutError("Your basket is empty.");
  const normalized = lines.map((line) => ({ slug: line.slug, quantity: Number(line.quantity || 1), priceMinor: line.priceMinor }));
  for (const line of normalized) {
    if (!line.slug || !Number.isInteger(line.quantity) || line.quantity < 1) throw new CheckoutError("Basket quantity is invalid.");
  }
  return normalized;
}

async function loadProducts(lines: BasketLineInput[], tx: Prisma.TransactionClient) {
  const products = await tx.product.findMany({ where: { slug: { in: lines.map((line) => line.slug) } } });
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  return lines.map((line) => {
    const product = bySlug.get(line.slug);
    if (!product) throw new CheckoutError("An item in your basket is no longer available.");
    return { line, product };
  });
}

function assertAvailable(items: { line: BasketLineInput; product: Product }[]) {
  for (const { line, product } of items) {
    if (product.inventoryState !== "PUBLISHED" || product.quantity < line.quantity) {
      throw new CheckoutError(`${product.title} is no longer available.`);
    }
    if (product.quantity === 1 && line.quantity > 1) throw new CheckoutError(`${product.title} is a one-copy item.`);
    if (line.priceMinor !== undefined && line.priceMinor !== product.priceMinor) {
      throw new CheckoutError(`${product.title} has changed price. Refresh your basket before checkout.`);
    }
  }
}

export async function createCheckout(input: CheckoutInput) {
  await expireReservations();
  const basket = validateBasketLines(input.basket);
  const deliveryMethod: DeliveryMethod = input.deliveryMethod === "collect" ? "CLICK_AND_COLLECT" : "SHIP_IE";
  const expiresAt = new Date(Date.now() + reservationMinutes * 60_000);

  const order = await db.$transaction(async (tx) => {
    const items = await loadProducts(basket, tx);
    assertAvailable(items);
    const quote = await quoteShipping(items.map((item) => item.product), input.deliveryMethod);
    if (!quote.available) throw new CheckoutError(quote.reason ?? "Selected delivery method is not available.");

    const updated: Product[] = [];
    for (const { line, product } of items) {
      const result = await tx.product.updateMany({
        where: { id: product.id, inventoryState: "PUBLISHED", quantity: { gte: line.quantity } },
        data: { inventoryState: "RESERVED" }
      });
      if (result.count !== 1) throw new CheckoutError(`${product.title} was just reserved by another customer.`);
      updated.push(product);
    }

    const subtotal = items.reduce((sum, item) => sum + item.product.priceMinor * item.line.quantity, 0);
    const created = await tx.order.create({
      data: {
        orderNumber: orderNumber(),
        checkoutReference: crypto.randomUUID(),
        userId: input.userId ?? null,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
        customerPhone: input.customerPhone || null,
        deliveryMethod,
        shippingAddress: input.deliveryMethod === "ship-ie" ? input.address ?? {} : Prisma.JsonNull,
        billingAddress: input.address ?? Prisma.JsonNull,
        subtotalMinor: subtotal,
        shippingCostMinor: quote.costMinor,
        totalMinor: subtotal + quote.costMinor,
        currency: "EUR",
        publicNotes: input.notes || null,
        items: {
          create: items.map(({ line, product }) => ({
            productId: product.id,
            productSlug: product.slug,
            title: product.title,
            skuSnapshot: product.sku,
            priceMinor: product.priceMinor,
            quantity: line.quantity,
            categorySnapshot: product.category,
            imageUrlSnapshot: product.imageUrl,
            conditionSnapshot: product.conditionGrade
          }))
        }
      },
      include: { items: true }
    });

    for (const product of updated) {
      await tx.inventoryReservation.create({ data: { productId: product.id, orderId: created.id, quantity: 1, expiresAt } });
    }
    return created;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  const session = await createCheckoutSession({
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    lineItems: order.items.map((item) => ({ title: item.title, quantity: item.quantity, unitAmountMinor: item.priceMinor })),
    shippingCostMinor: order.shippingCostMinor
  });

  const saved = await db.order.update({
    where: { id: order.id },
    data: {
      stripeSessionId: session.id,
      stripePaymentIntentId: session.paymentIntentId,
      reservations: { updateMany: { where: { orderId: order.id }, data: { checkoutSessionId: session.id, paymentIntentId: session.paymentIntentId } } }
    },
    include: { items: true }
  });
  return { order: saved, checkoutUrl: session.url };
}

export async function markOrderPaidByCheckoutSession(sessionId: string, paymentIntentId: string | null) {
  const order = await db.order.findUnique({ where: { stripeSessionId: sessionId }, include: { items: true, reservations: true } });
  if (!order) return null;
  if (order.paymentStatus === "PAID") return order;
  const paid = await db.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: order.id },
      data: { status: "PAID", paymentStatus: "PAID", paidAt: new Date(), stripePaymentIntentId: paymentIntentId ?? order.stripePaymentIntentId },
      include: { items: true }
    });
    await tx.inventoryReservation.updateMany({ where: { orderId: order.id, state: "ACTIVE" }, data: { state: "CONVERTED", convertedAt: new Date(), paymentIntentId: paymentIntentId ?? undefined } });
    for (const item of order.items) {
      await tx.product.update({ where: { id: item.productId }, data: { inventoryState: "SOLD", quantity: 0 } });
    }
    return updated;
  });
  await sendOrderEmail(paid.deliveryMethod === "CLICK_AND_COLLECT" ? "click-and-collect-confirmation" : "order-confirmation", paid);
  return paid;
}

export async function markOrderPaymentFailedByCheckoutSession(sessionId: string) {
  const order = await db.order.findUnique({ where: { stripeSessionId: sessionId }, include: { items: true } });
  if (!order || order.paymentStatus === "PAID") return order;
  const failed = await db.$transaction(async (tx) => {
    const updated = await tx.order.update({ where: { id: order.id }, data: { status: "PAYMENT_FAILED", paymentStatus: "FAILED" }, include: { items: true } });
    await tx.inventoryReservation.updateMany({ where: { orderId: order.id, state: "ACTIVE" }, data: { state: "CANCELLED", cancelledAt: new Date() } });
    for (const item of order.items) {
      await tx.product.updateMany({ where: { id: item.productId, inventoryState: "RESERVED" }, data: { inventoryState: "PUBLISHED" } });
    }
    return updated;
  });
  await sendOrderEmail("payment-failed", failed);
  return failed;
}
