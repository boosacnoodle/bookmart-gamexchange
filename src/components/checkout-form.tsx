"use client";

import { CreditCard, MapPin } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { createCheckoutAction, type CheckoutState } from "@/app/checkout/checkout-actions";
import { formatMoney } from "@/lib/format";
import { basketStorageKey, type BasketItem } from "./add-to-basket";

function readBasket(): BasketItem[] {
  try {
    return JSON.parse(window.localStorage.getItem(basketStorageKey()) ?? "[]") as BasketItem[];
  } catch {
    return [];
  }
}

const initial: CheckoutState = { ok: false, message: "" };

export function CheckoutForm({ stripeConfigured, defaultEmail, defaultName }: { stripeConfigured: boolean; defaultEmail?: string; defaultName?: string }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState("collect");
  const [state, action, pending] = useActionState(createCheckoutAction, initial);

  useEffect(() => {
    setItems(readBasket());
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0), [items]);

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h1>Checkout</h1>
        <p>Your basket is empty or has expired on this device.</p>
      </div>
    );
  }

  return (
    <form action={action} className="checkout-layout">
      <input type="hidden" name="basketJson" value={JSON.stringify(items.map((item) => ({ slug: item.slug, quantity: item.quantity, priceMinor: item.priceMinor })))} />
      <section className="checkout-panel">
        <h1>Secure checkout</h1>
        {!stripeConfigured ? (
          <p className="form-status error">Payment configuration is required before Stripe Checkout can be used. Basket review still works and no payment will be attempted.</p>
        ) : null}
        <div className="form-grid">
          <label>Customer email<input name="customerEmail" type="email" required defaultValue={defaultEmail} /></label>
          <label>Customer name<input name="customerName" required defaultValue={defaultName} /></label>
          <label>Telephone<input name="customerPhone" /></label>
        </div>
        <fieldset className="option-fieldset">
          <legend>Delivery method</legend>
          <label><input type="radio" name="deliveryMethod" value="collect" checked={deliveryMethod === "collect"} onChange={() => setDeliveryMethod("collect")} /> <MapPin size={16} /> Click and collect from Talbot Street</label>
          <label><input type="radio" name="deliveryMethod" value="ship-ie" checked={deliveryMethod === "ship-ie"} onChange={() => setDeliveryMethod("ship-ie")} /> Ireland shipping</label>
        </fieldset>
        {deliveryMethod === "ship-ie" ? (
          <div className="form-grid">
            <label>Address line 1<input name="line1" required={deliveryMethod === "ship-ie"} /></label>
            <label>Address line 2<input name="line2" /></label>
            <label>Town / city<input name="city" required={deliveryMethod === "ship-ie"} /></label>
            <label>Postcode / Eircode<input name="postcode" /></label>
          </div>
        ) : (
          <p className="muted-copy">Collection instructions are confirmed after payment. Shipping is not charged for click and collect.</p>
        )}
        <label>Order notes<textarea name="notes" placeholder="Optional public notes for staff" /></label>
      </section>
      <aside className="order-summary">
        <h2>Order summary</h2>
        {items.map((item) => (
          <div className="summary-line" key={item.slug}><span>{item.title} x {item.quantity}</span><strong>{formatMoney(item.priceMinor * item.quantity)}</strong></div>
        ))}
        <div className="summary-line"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
        <div className="summary-line"><span>Shipping</span><span>Validated on server</span></div>
        <button className="button button-primary wide" type="submit" disabled={pending}>
          <CreditCard size={18} /> {pending ? "Creating checkout..." : "Continue to Stripe Checkout"}
        </button>
        {state.message ? <p className={`form-status ${state.ok ? "success" : "error"}`} role="status">{state.message}</p> : null}
      </aside>
    </form>
  );
}
