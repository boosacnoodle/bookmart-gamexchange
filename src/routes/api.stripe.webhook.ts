import { createFileRoute } from "@tanstack/react-router";
import type Stripe from "stripe";

import { db } from "@/lib/db";
import {
  markOrderPaidByCheckoutSession,
  markOrderPaymentFailedByCheckoutSession,
} from "@/lib/payments/orders";
import { constructWebhookEvent } from "@/lib/payments/stripe";

function sessionFrom(event: Stripe.Event) {
  const object = event.data.object as {
    id?: string;
    payment_intent?: string | null;
    object?: string;
  };
  return object.object === "checkout.session"
    ? {
        sessionId: object.id ?? null,
        paymentIntentId: typeof object.payment_intent === "string" ? object.payment_intent : null,
      }
    : { sessionId: null, paymentIntentId: null };
}

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        let event: Stripe.Event;
        try {
          event = constructWebhookEvent(body, request.headers.get("stripe-signature") ?? "");
        } catch {
          return Response.json({ error: "Invalid webhook signature." }, { status: 400 });
        }
        if (await db.stripeWebhookEvent.findUnique({ where: { id: event.id } })) {
          return Response.json({ received: true, duplicate: true });
        }
        const { sessionId, paymentIntentId } = sessionFrom(event);
        let relatedOrderId: string | null = null;
        if (
          (event.type === "checkout.session.completed" ||
            event.type === "checkout.session.async_payment_succeeded") &&
          sessionId
        ) {
          relatedOrderId =
            (await markOrderPaidByCheckoutSession(sessionId, paymentIntentId))?.id ?? null;
        }
        if (
          (event.type === "checkout.session.async_payment_failed" ||
            event.type === "checkout.session.expired") &&
          sessionId
        ) {
          relatedOrderId = (await markOrderPaymentFailedByCheckoutSession(sessionId))?.id ?? null;
        }
        await db.stripeWebhookEvent.create({
          data: { id: event.id, type: event.type, payload: JSON.parse(body), relatedOrderId },
        });
        return Response.json({ received: true });
      },
    },
  },
});
