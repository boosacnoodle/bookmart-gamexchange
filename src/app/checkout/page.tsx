import { CheckoutForm } from "@/components/checkout-form";
import { getCurrentUser } from "@/lib/auth";
import { stripeRuntimeStatus } from "@/lib/payments/config";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const stripeStatus = stripeRuntimeStatus();
  return (
    <CheckoutForm stripeConfigured={stripeStatus.configured} defaultEmail={user?.email} defaultName={user?.name} />
  );
}
