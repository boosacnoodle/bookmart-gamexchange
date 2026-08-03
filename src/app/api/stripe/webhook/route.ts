import { headers } from "next/headers";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { constructWebhookEvent } from "@/lib/payments/stripe";
import { markOrderPaidByCheckoutSession, markOrderPaymentFailedByCheckoutSession } from "@/lib/payments/orders";

export const runtime = "nodejs";

function sessionIdFromEvent(event: Stripe.Event) {
  const data = event.data.object as { id?: string; payment_intent?: string | null; object?: string };
  if (data.object === "checkout.session") return { sessionId: data.id ?? null, paymentIntentId: typeof data.payment_intent === "string" ? data.payment_intent : null };
  return { sessionId: null, paymentIntentId: null };
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature") ?? "";
  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch {
    return Response.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const existing = await db.stripeWebhookEvent.findUnique({ where: { id: event.id } });
  if (existing) return Response.json({ received: true, duplicate: true });

  let relatedOrderId: string | null = null;
  const { sessionId, paymentIntentId } = sessionIdFromEvent(event);

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    if (sessionId) {
      const order = await markOrderPaidByCheckoutSession(sessionId, paymentIntentId);
      relatedOrderId = order?.id ?? null;
    }
  }

  if (event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired") {
    if (sessionId) {
      const order = await markOrderPaymentFailedByCheckoutSession(sessionId);
      relatedOrderId = order?.id ?? null;
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const object = event.data.object as { id?: string };
    const order = object.id ? await db.order.findFirst({ where: { stripePaymentIntentId: object.id } }) : null;
    if (order?.stripeSessionId) {
      await markOrderPaymentFailedByCheckoutSession(order.stripeSessionId);
      relatedOrderId = order.id;
    }
  }

  if (event.type === "charge.refunded" || event.type === "charge.refund.updated") {
    const object = event.data.object as { payment_intent?: string };
    const order = object.payment_intent ? await db.order.findFirst({ where: { stripePaymentIntentId: object.payment_intent } }) : null;
    relatedOrderId = order?.id ?? null;
  }

  await db.stripeWebhookEvent.create({
    data: {
      id: event.id,
      type: event.type,
      payload: JSON.parse(body),
      relatedOrderId
    }
  });
  return Response.json({ received: true });
}
