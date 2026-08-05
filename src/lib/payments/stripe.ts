import Stripe from "stripe";
import { appUrl, stripeRuntimeStatus } from "./config";

export type CheckoutSessionInput = {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  lineItems: { title: string; quantity: number; unitAmountMinor: number }[];
  shippingCostMinor: number;
};

export type CheckoutSessionResult = {
  id: string;
  url: string;
  paymentIntentId: string | null;
};

function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe secret key is not configured.");
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });
}

export async function createCheckoutSession(
  input: CheckoutSessionInput,
): Promise<CheckoutSessionResult> {
  const status = stripeRuntimeStatus();
  if (status.testAdapter) {
    return {
      id: `cs_test_adapter_${input.orderId}`,
      url: `${appUrl()}/order-confirmation?order=${encodeURIComponent(input.orderNumber)}&adapter=pending`,
      paymentIntentId: `pi_test_adapter_${input.orderId}`,
    };
  }
  if (!status.configured) throw new Error("Stripe Checkout is not configured.");

  const session = await stripeClient().checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    client_reference_id: input.orderId,
    success_url: `${appUrl()}/order-confirmation?order=${encodeURIComponent(input.orderNumber)}`,
    cancel_url: `${appUrl()}/checkout?cancelled=1`,
    metadata: {
      orderId: input.orderId,
      orderNumber: input.orderNumber,
    },
    line_items: [
      ...input.lineItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          product_data: { name: item.title },
          unit_amount: item.unitAmountMinor,
        },
      })),
      ...(input.shippingCostMinor > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency: "eur",
                product_data: { name: "Ireland shipping" },
                unit_amount: input.shippingCostMinor,
              },
            },
          ]
        : []),
    ],
  });
  return {
    id: session.id,
    url:
      session.url ??
      `${appUrl()}/order-confirmation?order=${encodeURIComponent(input.orderNumber)}`,
    paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
  };
}

export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  if (stripeRuntimeStatus().testAdapter) {
    return JSON.parse(payload.toString()) as Stripe.Event;
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET)
    throw new Error("Stripe webhook secret is not configured.");
  return stripeClient().webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );
}

export async function createStripeRefund(
  paymentIntentId: string,
  amountMinor: number,
  reason: string,
  idempotencyKey: string,
) {
  if (stripeRuntimeStatus().testAdapter) {
    return { id: `re_test_adapter_${idempotencyKey}`, amount: amountMinor, reason };
  }
  if (!stripeRuntimeStatus().configured) throw new Error("Stripe refunds are not configured.");
  return stripeClient().refunds.create(
    { payment_intent: paymentIntentId, amount: amountMinor, metadata: { reason } },
    { idempotencyKey },
  );
}
