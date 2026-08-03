"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/types";

export type BasketItem = {
  slug: string;
  title: string;
  priceMinor: number;
  imageUrl: string;
  quantity: number;
  maxQuantity: number;
  expiresAt: string;
};

const key = "bookmart-basket";

function readBasket(): BasketItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as BasketItem[];
  } catch {
    return [];
  }
}

function writeBasket(items: BasketItem[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new Event("basket:update"));
}

export function AddToBasket({ product }: { product: Product }) {
  const [message, setMessage] = useState("");
  const available = product.inventoryState === "PUBLISHED" && product.quantity > 0;

  function add() {
    if (!available) {
      setMessage("This item is not currently available.");
      return;
    }

    const basket = readBasket();
    const existing = basket.find((item) => item.slug === product.slug);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60_000).toISOString();
    const next = existing
      ? basket.map((item) => item.slug === product.slug ? { ...item, quantity: Math.min(item.quantity + 1, product.quantity), maxQuantity: product.quantity, expiresAt } : item)
      : [...basket, { slug: product.slug, title: product.title, priceMinor: product.priceMinor, imageUrl: product.imageUrl, quantity: 1, maxQuantity: product.quantity, expiresAt }];
    writeBasket(next);
    setMessage("Added to basket. Stock is finally reserved during secure checkout.");
  }

  return (
    <div>
      <button className="button button-primary wide" type="button" onClick={add}>
        <ShoppingBag size={18} /> Add to basket
      </button>
      {message ? <p className="form-status success" role="status">{message}</p> : null}
    </div>
  );
}

export function basketStorageKey() {
  return key;
}
