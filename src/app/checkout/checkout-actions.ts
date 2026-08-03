"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { stripeRuntimeStatus } from "@/lib/payments/config";
import { CheckoutError, createCheckout } from "@/lib/payments/orders";

export type CheckoutState = {
  ok: boolean;
  message: string;
};

const checkoutSchema = z.object({
  basketJson: z.string(),
  customerEmail: z.string().email("Enter a valid email address."),
  customerName: z.string().min(2, "Enter your name."),
  customerPhone: z.string().optional(),
  deliveryMethod: z.enum(["ship-ie", "collect"]),
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  notes: z.string().max(1000).optional()
});

const basketSchema = z.array(z.object({
  slug: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  priceMinor: z.coerce.number().int().min(0).optional()
}));

export async function createCheckoutAction(_: CheckoutState, formData: FormData): Promise<CheckoutState> {
  if (!stripeRuntimeStatus().configured) {
    return { ok: false, message: "Payment configuration is required before secure checkout can create a Stripe session. No payment has been attempted." };
  }

  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the checkout form." };

  let basket: z.infer<typeof basketSchema>;
  try {
    basket = basketSchema.parse(JSON.parse(parsed.data.basketJson));
  } catch {
    return { ok: false, message: "Basket data is invalid. Return to basket and try again." };
  }

  const user = await getCurrentUser();
  try {
    const checkout = await createCheckout({
      basket,
      customerEmail: parsed.data.customerEmail,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      deliveryMethod: parsed.data.deliveryMethod,
      userId: user?.id,
      address: {
        line1: parsed.data.line1,
        line2: parsed.data.line2,
        city: parsed.data.city,
        postcode: parsed.data.postcode,
        country: "IE"
      },
      notes: parsed.data.notes
    });
    redirect(checkout.checkoutUrl);
  } catch (error) {
    if (error instanceof CheckoutError) return { ok: false, message: error.message };
    return { ok: false, message: error instanceof Error ? error.message : "Checkout could not be created." };
  }
}
