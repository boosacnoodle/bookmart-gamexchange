import { beforeEach, describe, expect, test, vi } from "vitest";
import { ProductCategory } from "@prisma/client";
import { stripeRuntimeStatus } from "@/lib/payments/config";
import { quoteShipping } from "@/lib/payments/shipping";
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "stripe-signature": "test-signature" })
}));

import { createCheckout, expireReservations, markOrderPaidByCheckoutSession, markOrderPaymentFailedByCheckoutSession } from "@/lib/payments/orders";
import { sendOrderEmail } from "@/lib/payments/email";
import { createStripeRefund } from "@/lib/payments/stripe";

const product = {
  id: "p1",
  title: "Demo item",
  slug: "demo-item",
  sku: "BMGX-TEST",
  category: ProductCategory.BOOKS,
  priceMinor: 1000,
  quantity: 1,
  inventoryState: "PUBLISHED",
  collectionOnly: false,
  imageUrl: "/test.jpg",
  conditionGrade: "GOOD"
};

type TestOrderItem = {
  id: string;
  productId: string;
  productSlug: string;
  title: string;
  skuSnapshot: string;
  priceMinor: number;
  quantity: number;
  categorySnapshot: string;
  imageUrlSnapshot: string;
  conditionSnapshot: string;
};

type TestOrder = {
  id: string;
  orderNumber?: string;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  paymentStatus?: string;
  status?: string;
  emailStatus?: string;
  customerEmail?: string;
  customerName?: string;
  deliveryMethod?: string;
  shippingCostMinor?: number;
  subtotalMinor?: number;
  totalMinor?: number;
  items: TestOrderItem[];
} & Record<string, unknown>;

type TestReservation = {
  id: string;
  state: string;
  productId: string;
  orderId?: string;
  expiresAt: Date;
  checkoutSessionId?: string | null;
  paymentIntentId?: string | null;
};

type TestEmail = {
  status: string;
  template: string;
};

const store = {
  product: { ...product },
  order: null as TestOrder | null,
  reservation: null as TestReservation | null,
  emails: [] as TestEmail[],
  refunds: [] as Record<string, unknown>[]
  ,
  webhooks: new Map<string, Record<string, unknown>>()
};

vi.mock("@/lib/db", () => {
  const tx = {
    product: {
      findMany: vi.fn(async () => [store.product]),
      updateMany: vi.fn(async ({ where, data }) => {
        if (where.id === store.product.id && store.product.inventoryState === where.inventoryState && store.product.quantity >= (where.quantity?.gte ?? 1)) {
          store.product = { ...store.product, ...data };
          return { count: 1 };
        }
        return { count: 0 };
      }),
      update: vi.fn(async ({ data }) => {
        store.product = { ...store.product, ...data };
        return store.product;
      })
    },
    order: {
      create: vi.fn(async ({ data }: { data: { items: { create: Omit<TestOrderItem, "id">[] }; [key: string]: unknown } }) => {
        store.order = {
          id: "o1",
          orderNumber: "BMGX-TEST-1",
          stripeSessionId: null,
          stripePaymentIntentId: null,
          paymentStatus: "UNPAID",
          status: "PENDING_PAYMENT",
          emailStatus: "PENDING",
          ...data,
          items: data.items.create.map((item, index) => ({ id: `oi${index}`, ...item }))
        };
        return store.order;
      }),
      update: vi.fn(async ({ data }) => {
        store.order = { ...store.order, ...data };
        return store.order;
      }),
      findUnique: vi.fn(async () => store.order)
    },
    inventoryReservation: {
      create: vi.fn(async ({ data }) => {
        store.reservation = { id: "r1", state: "ACTIVE", ...data };
        return store.reservation;
      }),
      updateMany: vi.fn(async ({ data }) => {
        store.reservation = { ...store.reservation, ...data };
        return { count: 1 };
      }),
      findMany: vi.fn(async () => [])
    },
    siteSetting: { findUnique: vi.fn(async () => null) },
    emailEvent: {
      create: vi.fn(async ({ data }) => {
        store.emails.push(data);
        return data;
      })
    },
    refund: { create: vi.fn(async ({ data }) => {
      store.refunds.push(data);
      return data;
    }) },
    stripeWebhookEvent: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => store.webhooks.get(where.id) ?? null),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        store.webhooks.set(String(data.id), data);
        return data;
      })
    }
  };
  return {
    db: {
      ...tx,
      $transaction: vi.fn(async (callback: unknown) => Array.isArray(callback) ? Promise.all(callback) : (callback as (client: typeof tx) => Promise<unknown>)(tx))
    }
  };
});

beforeEach(() => {
  process.env.STRIPE_ENABLED = "false";
  process.env.STRIPE_TEST_ADAPTER = "false";
  process.env.EMAIL_ENABLED = "false";
  store.product = { ...product };
  store.order = null;
  store.reservation = null;
  store.emails = [];
  store.refunds = [];
  store.webhooks = new Map();
});

describe("payment configuration", () => {
  test("checkout is blocked when Stripe is disabled", async () => {
    await expect(createCheckout({ basket: [{ slug: "demo-item", quantity: 1 }], customerEmail: "a@example.com", customerName: "Ada", deliveryMethod: "collect" }))
      .rejects.toThrow("Stripe Checkout is not configured");
  });

  test("test adapter is explicit and does not require live Stripe keys", () => {
    process.env.STRIPE_TEST_ADAPTER = "true";
    expect(stripeRuntimeStatus()).toMatchObject({ configured: true, mode: "test-adapter" });
  });
});

describe("reservations and payment lifecycle", () => {
  beforeEach(() => {
    process.env.STRIPE_TEST_ADAPTER = "true";
  });

  test("creates a reservation and immutable order snapshots", async () => {
    const checkout = await createCheckout({ basket: [{ slug: "demo-item", quantity: 1, priceMinor: 1000 }], customerEmail: "a@example.com", customerName: "Ada", deliveryMethod: "collect" });
    expect(checkout.order.items[0]).toMatchObject({ title: "Demo item", skuSnapshot: "BMGX-TEST", priceMinor: 1000 });
    expect(store.product.inventoryState).toBe("RESERVED");
    expect(store.reservation?.state).toBe("ACTIVE");
  });

  test("blocks duplicate checkout attempts for a unique item", async () => {
    await createCheckout({ basket: [{ slug: "demo-item", quantity: 1 }], customerEmail: "a@example.com", customerName: "Ada", deliveryMethod: "collect" });
    await expect(createCheckout({ basket: [{ slug: "demo-item", quantity: 1 }], customerEmail: "b@example.com", customerName: "Ben", deliveryMethod: "collect" }))
      .rejects.toThrow("no longer available");
  });

  test("blocks stale price and invalid quantity", async () => {
    await expect(createCheckout({ basket: [{ slug: "demo-item", quantity: 2 }], customerEmail: "a@example.com", customerName: "Ada", deliveryMethod: "collect" }))
      .rejects.toThrow("no longer available");
    await expect(createCheckout({ basket: [{ slug: "demo-item", quantity: 1, priceMinor: 900 }], customerEmail: "a@example.com", customerName: "Ada", deliveryMethod: "collect" }))
      .rejects.toThrow("changed price");
  });

  test("webhook payment success converts reservation and marks product sold", async () => {
    const checkout = await createCheckout({ basket: [{ slug: "demo-item", quantity: 1 }], customerEmail: "a@example.com", customerName: "Ada", deliveryMethod: "collect" });
    await markOrderPaidByCheckoutSession(checkout.order.stripeSessionId!, "pi_test");
    expect(store.order?.paymentStatus).toBe("PAID");
    expect(store.product.inventoryState).toBe("SOLD");
    expect(store.reservation?.state).toBe("CONVERTED");
    expect(store.emails[0]).toMatchObject({ status: "SKIPPED", template: "click-and-collect-confirmation" });
  });

  test("failed payment releases stock", async () => {
    const checkout = await createCheckout({ basket: [{ slug: "demo-item", quantity: 1 }], customerEmail: "a@example.com", customerName: "Ada", deliveryMethod: "collect" });
    await markOrderPaymentFailedByCheckoutSession(checkout.order.stripeSessionId!);
    expect(store.order?.paymentStatus).toBe("FAILED");
    expect(store.product.inventoryState).toBe("PUBLISHED");
    expect(store.reservation?.state).toBe("CANCELLED");
  });

  test("webhook processing is idempotent", async () => {
    const checkout = await createCheckout({ basket: [{ slug: "demo-item", quantity: 1 }], customerEmail: "a@example.com", customerName: "Ada", deliveryMethod: "collect" });
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const payload = {
      id: "evt_test_1",
      type: "checkout.session.completed",
      data: { object: { object: "checkout.session", id: checkout.order.stripeSessionId, payment_intent: "pi_test" } }
    };
    const first = await POST(new Request("http://localhost/api/stripe/webhook", { method: "POST", body: JSON.stringify(payload) }));
    const duplicate = await POST(new Request("http://localhost/api/stripe/webhook", { method: "POST", body: JSON.stringify(payload) }));
    expect(first.status).toBe(200);
    expect(await duplicate.json()).toMatchObject({ duplicate: true });
    expect(store.webhooks.size).toBe(1);
  });
});

describe("shipping, email and refunds", () => {
  test("click and collect is free and collection-only products cannot ship", async () => {
    await expect(quoteShipping([{ collectionOnly: false, priceMinor: 1000, category: ProductCategory.BOOKS }], "collect")).resolves.toMatchObject({ costMinor: 0, available: true });
    await expect(quoteShipping([{ collectionOnly: true, priceMinor: 1000, category: ProductCategory.RARE_COLLECTIBLE }], "ship-ie")).resolves.toMatchObject({ available: false });
  });

  test("email disabled logs skipped instead of failing order processing", async () => {
    store.order = { id: "o1", customerEmail: "a@example.com", orderNumber: "BMGX-1", totalMinor: 1000, items: [] };
    await sendOrderEmail("order-confirmation", store.order as Parameters<typeof sendOrderEmail>[1]);
    expect(store.emails[0]).toMatchObject({ status: "SKIPPED" });
  });

  test("test adapter refund returns a deterministic refund object", async () => {
    process.env.STRIPE_TEST_ADAPTER = "true";
    await expect(createStripeRefund("pi_test", 500, "Customer request", "idem-1")).resolves.toMatchObject({ id: "re_test_adapter_idem-1", amount: 500 });
  });

  test("reservation expiration helper is callable", async () => {
    await expect(expireReservations()).resolves.toBe(0);
  });
});
