import type { Order, OrderItem } from "@prisma/client";
import { db } from "@/lib/db";
import { emailRuntimeStatus } from "./config";
import { formatMoney } from "@/lib/format";

export type EmailTemplate =
  | "order-confirmation"
  | "payment-failed"
  | "click-and-collect-confirmation"
  | "ready-for-collection"
  | "order-shipped"
  | "refund-confirmation"
  | "password-reset";

type OrderWithItems = Order & { items: OrderItem[] };

function subjectFor(template: EmailTemplate, order?: OrderWithItems) {
  const number = order ? ` ${order.orderNumber}` : "";
  const subjects: Record<EmailTemplate, string> = {
    "order-confirmation": `Bookmart & Gamexchange order${number}`,
    "payment-failed": `Payment issue with Bookmart & Gamexchange order${number}`,
    "click-and-collect-confirmation": `Click and collect order${number}`,
    "ready-for-collection": `Your Bookmart & Gamexchange order is ready${number}`,
    "order-shipped": `Your Bookmart & Gamexchange order has shipped${number}`,
    "refund-confirmation": `Refund confirmation for order${number}`,
    "password-reset": "Reset your Bookmart & Gamexchange password",
  };
  return subjects[template];
}

function bodyFor(template: EmailTemplate, order: OrderWithItems) {
  const lines = [
    "Bookmart & Gamexchange",
    "73 Talbot Street, Dublin 1",
    "",
    `Order: ${order.orderNumber}`,
    `Total: ${formatMoney(order.totalMinor)}`,
    "",
    ...order.items.map(
      (item) => `- ${item.title} (${item.skuSnapshot}) - ${formatMoney(item.priceMinor)}`,
    ),
    "",
  ];
  if (template === "ready-for-collection" || template === "click-and-collect-confirmation") {
    lines.push(
      "Collection: bring your order number to the Talbot Street shop during configured opening hours.",
    );
  }
  if (template === "payment-failed") lines.push("No payment has been captured for this order.");
  if (template === "refund-confirmation") lines.push("A refund has been recorded for this order.");
  return lines.join("\n");
}

export async function sendOrderEmail(template: EmailTemplate, order: OrderWithItems) {
  const status = emailRuntimeStatus();
  const subject = subjectFor(template, order);
  if (!status.configured) {
    await db.emailEvent.create({
      data: {
        orderId: order.id,
        recipient: order.customerEmail,
        template,
        subject,
        status: "SKIPPED",
        provider: status.provider,
        errorMessage: "Transactional email is disabled or not configured.",
      },
    });
    await db.order.update({ where: { id: order.id }, data: { emailStatus: "SKIPPED" } });
    return { sent: false, skipped: true };
  }

  try {
    if (status.provider === "resend") {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM_ADDRESS,
          to: order.customerEmail,
          subject,
          text: bodyFor(template, order),
        }),
      });
      if (!response.ok) throw new Error(`Resend returned ${response.status}`);
    }
    await db.emailEvent.create({
      data: {
        orderId: order.id,
        recipient: order.customerEmail,
        template,
        subject,
        status: "SENT",
        provider: status.provider,
        sentAt: new Date(),
      },
    });
    await db.order.update({ where: { id: order.id }, data: { emailStatus: "SENT" } });
    return { sent: true, skipped: false };
  } catch (error) {
    await db.emailEvent.create({
      data: {
        orderId: order.id,
        recipient: order.customerEmail,
        template,
        subject,
        status: "FAILED",
        provider: status.provider,
        errorMessage: error instanceof Error ? error.message : "Email provider failed.",
      },
    });
    await db.order.update({ where: { id: order.id }, data: { emailStatus: "FAILED" } });
    return { sent: false, skipped: false };
  }
}
