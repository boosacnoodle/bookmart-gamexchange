import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ShopPage } from "@/components/shop/ShopPage";
import { beginCheckout, getCheckoutItems } from "@/lib/checkout.server";
import { useList } from "@/lib/shop-lists";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({
    meta: [{ title: "Checkout — Bookmart & GameXchange" }, { name: "robots", content: "noindex" }],
  }),
});

function CheckoutPage() {
  const keys = useList("basket");
  const keysKey = keys.join("\u001f");
  const navigate = useNavigate();
  const [items, setItems] = useState<Awaited<ReturnType<typeof getCheckoutItems>>>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<"collect" | "ship-ie">("collect");
  const [problem, setProblem] = useState("");
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (keysKey) void getCheckoutItems({ data: { keys: keysKey.split("\u001f") } }).then(setItems);
  }, [keysKey]);

  return (
    <ShopPage
      eyebrow="At the till"
      title="Checkout"
      intro="Your copy is held for 30 minutes while Stripe handles the payment securely."
    >
      <form
        className="grid max-w-2xl gap-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setProblem("");
          setPending(true);
          const form = new FormData(event.currentTarget);
          try {
            const result = await beginCheckout({
              data: {
                keys,
                customerName: String(form.get("name") || ""),
                customerEmail: String(form.get("email") || ""),
                customerPhone: String(form.get("phone") || ""),
                deliveryMethod,
                line1: String(form.get("line1") || ""),
                line2: String(form.get("line2") || ""),
                city: String(form.get("city") || ""),
                postcode: String(form.get("postcode") || ""),
                notes: String(form.get("notes") || ""),
              },
            });
            window.location.assign(result.checkoutUrl);
          } catch (error) {
            setProblem(error instanceof Error ? error.message : "Checkout could not start.");
            setPending(false);
          }
        }}
      >
        <p className="shop-meta text-brass/60">
          {items.length} live item{items.length === 1 ? "" : "s"} · €
          {(items.reduce((sum, item) => sum + item.priceMinor, 0) / 100).toFixed(2)}
        </p>
        <Input name="name" label="Your name" autoComplete="name" required />
        <Input name="email" label="Email" type="email" autoComplete="email" required />
        <Input name="phone" label="Phone (optional)" type="tel" autoComplete="tel" />
        <fieldset className="grid gap-2">
          <legend className="shop-meta mb-2 text-brass/60">Getting it home</legend>
          <label className="flex min-h-12 items-center gap-3">
            <input
              type="radio"
              checked={deliveryMethod === "collect"}
              onChange={() => setDeliveryMethod("collect")}
            />{" "}
            Click &amp; collect — free
          </label>
          <label className="flex min-h-12 items-center gap-3">
            <input
              type="radio"
              checked={deliveryMethod === "ship-ie"}
              onChange={() => setDeliveryMethod("ship-ie")}
            />{" "}
            Ireland delivery
          </label>
        </fieldset>
        {deliveryMethod === "ship-ie" ? (
          <div className="grid gap-4 rounded-sm border border-brass/15 p-4">
            <Input name="line1" label="Address" autoComplete="address-line1" required />
            <Input name="line2" label="Address line 2" autoComplete="address-line2" />
            <Input name="city" label="Town or city" autoComplete="address-level2" required />
            <Input name="postcode" label="Eircode" autoComplete="postal-code" />
          </div>
        ) : null}
        <label>
          <span className="shop-meta text-brass/60">Order note (optional)</span>
          <textarea
            name="notes"
            rows={3}
            className="mt-2 block w-full rounded-sm bg-timber-deep/65 px-4 py-3 text-lamplight"
          />
        </label>
        <p aria-live="polite" className="text-sm text-lamplight/80">
          {problem}
        </p>
        <button
          disabled={pending || items.length !== keys.length || !items.length}
          className="sign-plate min-h-14 rounded-sm bg-timber px-6 text-lamplight disabled:opacity-40"
        >
          {pending ? "Opening secure payment…" : "Continue to secure payment"}
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/basket" })}
          className="shop-meta min-h-12 text-brass/70"
        >
          Back to basket
        </button>
      </form>
    </ShopPage>
  );
}

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label>
      <span className="shop-meta text-brass/60">{label}</span>
      <input
        {...props}
        className="mt-2 block min-h-12 w-full rounded-sm bg-timber-deep/65 px-4 text-lamplight"
      />
    </label>
  );
}
