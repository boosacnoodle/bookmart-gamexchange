"use client";

import Image from "next/image";
import Link from "next/link";
import { PackageCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/lib/format";
import { basketStorageKey, type BasketItem } from "./add-to-basket";

function readBasket(): BasketItem[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(basketStorageKey()) ?? "[]") as BasketItem[];
    const fresh = parsed.filter((item) => !item.expiresAt || new Date(item.expiresAt).getTime() > Date.now());
    if (fresh.length !== parsed.length) window.localStorage.setItem(basketStorageKey(), JSON.stringify(fresh));
    return fresh;
  } catch {
    return [];
  }
}

export function BasketView() {
  const [items, setItems] = useState<BasketItem[]>([]);

  useEffect(() => {
    setItems(readBasket());
    const sync = () => setItems(readBasket());
    window.addEventListener("basket:update", sync);
    return () => window.removeEventListener("basket:update", sync);
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0), [items]);
  const estimatedShipping = total >= 7500 ? 0 : 595;

  function remove(slug: string) {
    const next = items.filter((item) => item.slug !== slug);
    window.localStorage.setItem(basketStorageKey(), JSON.stringify(next));
    setItems(next);
  }

  function updateQuantity(slug: string, quantity: number) {
    const next = items.map((item) => {
      if (item.slug !== slug) return item;
      const max = item.maxQuantity || 1;
      return { ...item, quantity: Math.max(1, Math.min(quantity, max)) };
    });
    window.localStorage.setItem(basketStorageKey(), JSON.stringify(next));
    setItems(next);
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h1>Your basket is empty</h1>
        <p>Search current stock or browse categories to find a one-off item.</p>
        <Link href="/search" className="button button-primary">Search inventory</Link>
      </div>
    );
  }

  return (
    <section className="basket-layout">
      <div className="basket-items">
        {items.map((item) => (
          <article className="basket-row" key={item.slug}>
            <Image src={item.imageUrl} alt="" width={110} height={132} />
            <div>
              <h2><Link href={`/products/${item.slug}`}>{item.title}</Link></h2>
              <label>Quantity
                <input
                  type="number"
                  min={1}
                  max={item.maxQuantity || 1}
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item.slug, Number(event.target.value))}
                  disabled={(item.maxQuantity || 1) === 1}
                />
              </label>
              {(item.maxQuantity || 1) === 1 ? <p>One copy available</p> : null}
              <strong>{formatMoney(item.priceMinor)}</strong>
            </div>
            <button type="button" className="icon-link" aria-label={`Remove ${item.title}`} onClick={() => remove(item.slug)}>
              <Trash2 size={18} />
            </button>
          </article>
        ))}
      </div>
      <aside className="order-summary">
        <h2>Order summary</h2>
        <p>Items are reserved only after server-side checkout validation.</p>
        <div className="summary-line"><span>Subtotal</span><strong>{formatMoney(total)}</strong></div>
        <div className="summary-line"><span>Estimated Ireland shipping</span><span>{formatMoney(estimatedShipping)}</span></div>
        <p><PackageCheck size={16} /> Click and collect is free from 73 Talbot Street.</p>
        <Link className="button button-primary wide" href="/checkout">Continue to secure checkout</Link>
      </aside>
    </section>
  );
}
