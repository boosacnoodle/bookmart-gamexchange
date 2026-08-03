"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendOrderEmail } from "@/lib/payments/email";
import { createStripeRefund } from "@/lib/payments/stripe";

const productSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  category: z.enum(["BOOKS", "GAMES", "CONSOLES", "VINYL", "RARE_COLLECTIBLE", "MUSIC_FILM", "JEWELLERY_CURIOSITIES"]),
  subcategory: z.string().min(2),
  creator: z.string().optional(),
  publisher: z.string().optional(),
  platform: z.string().optional(),
  format: z.string().optional(),
  isbn: z.string().optional(),
  ean: z.string().optional(),
  priceMajor: z.coerce.number().min(0),
  shortDescription: z.string().min(10),
  description: z.string().min(10),
  conditionGrade: z.enum(["NEW_SEALED", "LIKE_NEW", "VERY_GOOD", "GOOD", "ACCEPTABLE", "FOR_PARTS_UNTESTED", "STAFF_REVIEWED_COLLECTIBLE"]),
  conditionReport: z.string().min(10),
  included: z.string().optional(),
  missing: z.string().optional(),
  testedStatus: z.string().optional(),
  shelfLocation: z.string().min(2),
  stockLocationId: z.string().optional(),
  quantity: z.coerce.number().int().min(0),
  inventoryState: z.enum(["DRAFT", "NEEDS_REVIEW", "READY", "PUBLISHED", "RESERVED", "SOLD", "ARCHIVED", "REJECTED"]),
  isFeatured: z.coerce.boolean().optional(),
  isStaffPick: z.coerce.boolean().optional(),
  isRare: z.coerce.boolean().optional()
});

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 90);
}

function splitList(value?: string) {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
}

function productData(data: z.infer<typeof productSchema>) {
  return {
    title: data.title,
    slug: slugify(data.title),
    category: data.category,
    subcategory: data.subcategory,
    creator: data.creator || null,
    publisher: data.publisher || null,
    platform: data.platform || null,
    format: data.format || null,
    isbn: data.isbn || null,
    ean: data.ean || null,
    priceMinor: Math.round(data.priceMajor * 100),
    shortDescription: data.shortDescription,
    description: data.description,
    conditionGrade: data.conditionGrade,
    conditionReport: data.conditionReport,
    included: splitList(data.included),
    missing: splitList(data.missing),
    testedStatus: data.testedStatus || null,
    shelfLocation: data.shelfLocation,
    stockLocationId: data.stockLocationId || null,
    quantity: data.quantity,
    inventoryState: data.inventoryState,
    isFeatured: Boolean(data.isFeatured),
    isStaffPick: Boolean(data.isStaffPick),
    isRare: Boolean(data.isRare)
  };
}

async function writeAudit(userId: string, action: string, entity: string, entityId: string, before: unknown, after: unknown) {
  await db.auditLog.create({ data: { userId, action, entity, entityId, before: before === null ? undefined : JSON.parse(JSON.stringify(before)), after: after === null ? undefined : JSON.parse(JSON.stringify(after)) } });
}

async function saveImage(file: File | null) {
  if (!file || file.size === 0) return undefined;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Unsupported image type.");
  if (file.size > 5_000_000) throw new Error("Image must be under 5MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${Date.now()}-${slugify(file.name)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);
  return `/uploads/${filename}`;
}

export async function saveProduct(formData: FormData) {
  const user = await requireUser(["STAFF", "ADMIN"]);
  const parsed = productSchema.parse(Object.fromEntries(formData));
  const image = formData.get("image");
  const imageUrl = await saveImage(image instanceof File ? image : null);
  if (parsed.id) {
    const before = await db.product.findUniqueOrThrow({ where: { id: parsed.id } });
    const after = await db.product.update({ where: { id: parsed.id }, data: { ...productData(parsed), ...(imageUrl ? { imageUrl, gallery: [imageUrl] } : {}) } });
    await writeAudit(user.id, "inventory.update", "Product", after.id, before, after);
    redirect(`/staff/inventory/${after.id}`);
  }
  const created = await db.product.create({
    data: {
      ...productData(parsed),
      imageUrl: imageUrl ?? "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=82",
      gallery: [imageUrl ?? "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=82"],
      sku: `BMGX-${Date.now()}`
    }
  });
  await writeAudit(user.id, "inventory.create", "Product", created.id, null, created);
  redirect(`/staff/inventory/${created.id}`);
}

export async function changeProductState(formData: FormData) {
  const user = await requireUser(["STAFF", "ADMIN"]);
  const id = z.string().parse(formData.get("id"));
  const state = z.enum(["DRAFT", "NEEDS_REVIEW", "READY", "PUBLISHED", "RESERVED", "SOLD", "ARCHIVED", "REJECTED"]).parse(formData.get("state"));
  const before = await db.product.findUniqueOrThrow({ where: { id } });
  const after = await db.product.update({ where: { id }, data: { inventoryState: state, publishedAt: state === "PUBLISHED" ? new Date() : before.publishedAt } });
  await writeAudit(user.id, `inventory.${state.toLowerCase()}`, "Product", id, before, after);
}

export async function saveStockLocation(formData: FormData) {
  const user = await requireUser(["STAFF", "ADMIN"]);
  const data = z.object({ id: z.string().optional(), name: z.string().min(2), publicLabel: z.string().min(2), notes: z.string().optional() }).parse(Object.fromEntries(formData));
  const saved = data.id
    ? await db.stockLocation.update({ where: { id: data.id }, data })
    : await db.stockLocation.create({ data: { name: data.name, publicLabel: data.publicLabel, notes: data.notes } });
  await writeAudit(user.id, data.id ? "stock-location.update" : "stock-location.create", "StockLocation", saved.id, null, saved);
  redirect("/staff/locations");
}

export async function updateOrderStatus(formData: FormData) {
  const user = await requireUser(["STAFF", "ADMIN"]);
  const id = z.string().parse(formData.get("id"));
  const status = z.enum(["PENDING_PAYMENT", "PAID", "PROCESSING", "READY_FOR_COLLECTION", "SHIPPED", "COMPLETED", "CANCELLED", "PAYMENT_FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]).parse(formData.get("status"));
  const trackingNumber = z.string().optional().parse(formData.get("trackingNumber") || undefined);
  const staffNotes = z.string().optional().parse(formData.get("staffNotes") || undefined);
  const before = await db.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
  const after = await db.order.update({
    where: { id },
    data: {
      status,
      trackingNumber,
      staffNotes,
      readyAt: status === "READY_FOR_COLLECTION" ? new Date() : before.readyAt,
      shippedAt: status === "SHIPPED" ? new Date() : before.shippedAt,
      completedAt: status === "COMPLETED" ? new Date() : before.completedAt,
      cancelledAt: status === "CANCELLED" ? new Date() : before.cancelledAt
    },
    include: { items: true }
  });
  await writeAudit(user.id, `order.${status.toLowerCase()}`, "Order", id, before, after);
  if (status === "READY_FOR_COLLECTION") await sendOrderEmail("ready-for-collection", after);
  if (status === "SHIPPED") await sendOrderEmail("order-shipped", after);
}

export async function refundOrder(formData: FormData) {
  const user = await requireUser(["ADMIN"]);
  const data = z.object({
    orderId: z.string(),
    amountMajor: z.coerce.number().positive(),
    reason: z.string().min(5)
  }).parse(Object.fromEntries(formData));
  const amountMinor = Math.round(data.amountMajor * 100);
  const order = await db.order.findUniqueOrThrow({ where: { id: data.orderId }, include: { items: true, refunds: true } });
  if (order.paymentStatus !== "PAID" && order.paymentStatus !== "PARTIALLY_REFUNDED") throw new Error("Only paid orders can be refunded.");
  const refunded = order.refunds.filter((refund) => refund.status === "SUCCEEDED").reduce((sum, refund) => sum + refund.amountMinor, 0);
  if (amountMinor + refunded > order.totalMinor) throw new Error("Refund cannot exceed the amount paid.");
  if (!order.stripePaymentIntentId) throw new Error("Order has no payment intent to refund.");
  const idempotencyKey = `refund-${order.id}-${amountMinor}-${Date.now()}`;
  const stripeRefund = await createStripeRefund(order.stripePaymentIntentId, amountMinor, data.reason, idempotencyKey);
  const refund = await db.refund.create({
    data: {
      orderId: order.id,
      amountMinor,
      reason: data.reason,
      status: "SUCCEEDED",
      stripeRefundId: stripeRefund.id,
      idempotencyKey,
      createdById: user.id
    }
  });
  const totalRefunded = refunded + amountMinor;
  const after = await db.order.update({
    where: { id: order.id },
    data: {
      status: totalRefunded >= order.totalMinor ? "REFUNDED" : "PARTIALLY_REFUNDED",
      paymentStatus: totalRefunded >= order.totalMinor ? "REFUNDED" : "PARTIALLY_REFUNDED"
    },
    include: { items: true }
  });
  await writeAudit(user.id, "order.refund", "Order", order.id, order, { refund, order: after });
  await sendOrderEmail("refund-confirmation", after);
}

export async function saveSetting(formData: FormData) {
  const user = await requireUser(["ADMIN"]);
  const data = z.object({ key: z.string(), value: z.string() }).parse(Object.fromEntries(formData));
  const before = await db.siteSetting.findUnique({ where: { key: data.key } });
  const after = await db.siteSetting.update({ where: { key: data.key }, data: { value: data.value } });
  await writeAudit(user.id, "setting.update", "SiteSetting", data.key, before, after);
}

export async function saveLegalPage(formData: FormData) {
  const user = await requireUser(["ADMIN"]);
  const data = z.object({ slug: z.string(), title: z.string().min(2), body: z.string().min(10) }).parse(Object.fromEntries(formData));
  const before = await db.legalPage.findUnique({ where: { slug: data.slug } });
  const after = await db.legalPage.upsert({ where: { slug: data.slug }, create: data, update: data });
  await writeAudit(user.id, "legal.update", "LegalPage", data.slug, before, after);
}

export async function saveUserRole(formData: FormData) {
  const user = await requireUser(["ADMIN"]);
  const data = z.object({ id: z.string(), role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]) }).parse(Object.fromEntries(formData));
  const before = await db.user.findUniqueOrThrow({ where: { id: data.id } });
  const after = await db.user.update({ where: { id: data.id }, data: { role: data.role } });
  await writeAudit(user.id, "user.role.update", "User", data.id, before, after);
}
