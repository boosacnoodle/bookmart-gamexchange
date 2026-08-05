import type { OrderStatus } from "@prisma/client";

import { requireStaffOnServer } from "./auth-impl.server";
import { db } from "./db";
import { aiPhotoConfigured } from "./intake/ai-service";
import { emailRuntimeStatus, stripeRuntimeStatus } from "./payments/config";

export async function backofficeStatusOnServer() {
  await requireStaffOnServer();
  const recentErrors = await db.intakeSession.findMany({
    where: { errorMessage: { not: null } },
    orderBy: { updatedAt: "desc" },
    take: 8,
    select: { id: true, barcode: true, errorMessage: true, updatedAt: true },
  });
  return {
    barcodeEnabled: process.env.BARCODE_INTAKE_ENABLED !== "false",
    metadata: {
      available: true,
      priority: ["Open Library for ISBN books", "Staff manual completion"],
    },
    ocrEnabled: false,
    aiPhotoEnabled: aiPhotoConfigured(),
    cameraRequirement:
      "Camera scanning needs HTTPS on a live site. Manual barcode entry always remains available.",
    stripe: stripeRuntimeStatus(),
    email: emailRuntimeStatus(),
    recentErrors: recentErrors.map((item) => ({
      id: item.id,
      barcode: item.barcode,
      message: item.errorMessage,
      updatedAt: item.updatedAt.toISOString(),
    })),
  };
}

export async function staffOrdersOnServer() {
  await requireStaffOnServer();
  const orders = await db.order.findMany({
    where: {
      status: { in: ["PAID", "PROCESSING", "READY_FOR_COLLECTION", "SHIPPED"] },
    },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });
  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    status: order.status,
    paymentStatus: order.paymentStatus,
    deliveryMethod: order.deliveryMethod,
    totalMinor: order.totalMinor,
    createdAt: order.createdAt.toISOString(),
    address: order.shippingAddress,
    notes: order.publicNotes,
    items: order.items.map((item) => ({
      id: item.id,
      title: item.title,
      sku: item.skuSnapshot,
      quantity: item.quantity,
    })),
  }));
}

export async function updateStaffOrderOnServer(data: {
  orderId: string;
  action: "processing" | "ready" | "shipped" | "completed";
}) {
  const user = await requireStaffOnServer();
  const current = await db.order.findUnique({ where: { id: data.orderId } });
  if (!current || current.paymentStatus !== "PAID")
    throw new Error("That paid order could not be found.");

  const next: Record<typeof data.action, OrderStatus> = {
    processing: "PROCESSING",
    ready: "READY_FOR_COLLECTION",
    shipped: "SHIPPED",
    completed: "COMPLETED",
  };
  const status = next[data.action];
  if (status === "READY_FOR_COLLECTION" && current.deliveryMethod !== "CLICK_AND_COLLECT") {
    throw new Error("A delivery order cannot be marked ready for collection.");
  }
  if (status === "SHIPPED" && current.deliveryMethod !== "SHIP_IE") {
    throw new Error("A collection order cannot be marked shipped.");
  }

  const order = await db.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: current.id },
      data: {
        status,
        readyAt: status === "READY_FOR_COLLECTION" ? new Date() : current.readyAt,
        shippedAt: status === "SHIPPED" ? new Date() : current.shippedAt,
        completedAt: status === "COMPLETED" ? new Date() : current.completedAt,
      },
    });
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "order.status_changed",
        entity: "Order",
        entityId: current.id,
        before: { status: current.status },
        after: { status },
      },
    });
    return updated;
  });
  return { id: order.id, status: order.status };
}
