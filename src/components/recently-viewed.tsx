"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const key = "bookmart-recent";

export function TrackRecentlyViewed({ slug, title }: { slug: string; title: string }) {
  useEffect(() => {
    const current = JSON.parse(window.localStorage.getItem(key) ?? "[]") as Array<{ slug: string; title: string }>;
    const next = [{ slug, title }, ...current.filter((item) => item.slug !== slug)].slice(0, 5);
    window.localStorage.setItem(key, JSON.stringify(next));
  }, [slug, title]);
  return null;
}

export function RecentlyViewed() {
  const [items, setItems] = useState<Array<{ slug: string; title: string }>>([]);
  useEffect(() => {
    setItems(JSON.parse(window.localStorage.getItem(key) ?? "[]") as Array<{ slug: string; title: string }>);
  }, []);
  if (items.length === 0) return null;
  return (
    <section className="section compact">
      <div className="section-head">
        <h2>Recently viewed</h2>
      </div>
      <div className="recent-list">
        {items.map((item) => <Link href={`/products/${item.slug}`} key={item.slug}>{item.title}</Link>)}
      </div>
    </section>
  );
}
