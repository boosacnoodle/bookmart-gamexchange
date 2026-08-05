import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ListRow } from "@/components/shop/ListRow";
import { ShopPage } from "@/components/shop/ShopPage";
import { SHOP } from "@/data/shop";
import { STOCK, formatPrice, type StockItem } from "@/data/stock";
import { getCheckoutItems } from "@/lib/checkout.server";
import { clearList, removeFrom, useList } from "@/lib/shop-lists";

const TITLE = "On the counter — Bookmart & GameXchange";
const DESCRIPTION =
  "The things you have put on the counter at Bookmart & GameXchange. Every copy is the only one we have, so we hold it while you decide.";

export const Route = createFileRoute("/basket")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Basket,
});

function Basket() {
  const ids = useList("basket");
  const idsKey = ids.join("\u001f");
  const [live, setLive] = useState<Awaited<ReturnType<typeof getCheckoutItems>>>([]);
  useEffect(() => {
    if (!idsKey) {
      setLive([]);
      return;
    }
    void getCheckoutItems({ data: { keys: idsKey.split("\u001f") } })
      .then(setLive)
      .catch(() => setLive([]));
  }, [idsKey]);
  const liveByKey = new Map(
    live.flatMap((item) => [
      [item.id, item],
      [item.slug, item],
    ]),
  );
  const items = ids
    .map((id): StockItem | undefined => {
      const databaseItem = liveByKey.get(id);
      if (databaseItem) {
        return {
          id: databaseItem.id,
          slug: databaseItem.slug,
          title: databaseItem.title,
          maker: databaseItem.maker,
          room: normalizeRoom(databaseItem.room),
          shelf: databaseItem.shelf,
          tags: [],
          price: databaseItem.priceMinor / 100,
          condition: databaseItem.condition,
          note: "",
          traded: databaseItem.publishedAt,
          imageUrl: databaseItem.imageUrl,
          collectionOnly: databaseItem.collectionOnly,
          deliveryEligible: databaseItem.deliveryEligible,
          clickCollectEligible: databaseItem.clickCollectEligible,
        };
      }
      return STOCK.find((item) => item.id === id);
    })
    .filter((item): item is StockItem => Boolean(item));
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const allLive = ids.length > 0 && ids.every((id) => liveByKey.has(id));

  return (
    <ShopPage
      eyebrow="At the till"
      title="On the counter"
      intro="Nothing is charged here. Bring this list in, or ring us and we will hold it behind the counter for two days."
    >
      {items.length === 0 ? (
        <div
          className="rounded-sm bg-timber-deep/65 p-6 sm:p-8"
          style={{ boxShadow: "var(--shadow-plate)" }}
        >
          <p className="text-[0.95rem] leading-[1.7] text-foreground/70">
            The counter is empty. Have a wander through the rooms and put something down.
          </p>
          <Link
            to="/"
            className="shop-meta mt-6 inline-flex text-brass/75 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
          >
            Back to the shop &rarr;
          </Link>
        </div>
      ) : (
        <>
          <ul className="grid gap-3">
            {items.map((item) => (
              <ListRow
                key={item.id}
                item={item}
                removeLabel="Put back on the shelf"
                onRemove={() => removeFrom("basket", item.id)}
              />
            ))}
          </ul>

          <div className="mt-8 grid gap-5 border-t border-brass/15 pt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="min-w-0">
              <p className="shop-meta text-brass/60">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
              <p className="sign-plate mt-2 text-[1.4rem] text-lamplight">{formatPrice(total)}</p>
              <p className="measure mt-3 text-[0.85rem] leading-[1.7] text-foreground/55">
                Pay in the shop, or call us on{" "}
                <a
                  href={SHOP.phoneHref}
                  className="text-brass/85 underline decoration-brass/40 underline-offset-4 transition-colors hover:text-lamplight"
                >
                  {SHOP.phone}
                </a>{" "}
                and we will put it aside.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {allLive ? (
                <Link
                  to="/checkout"
                  className="shop-meta rounded-sm bg-timber/85 px-6 py-3.5 text-lamplight"
                  style={{
                    boxShadow:
                      "var(--shadow-plate), inset 0 0 0 1px color-mix(in oklab, var(--brass) 34%, transparent)",
                  }}
                >
                  Secure checkout
                </Link>
              ) : null}
              <a
                href={SHOP.phoneHref}
                className="shop-meta rounded-sm bg-timber/85 px-6 py-3.5 text-lamplight transition-colors duration-200 ease-[var(--ease-brass)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
                style={{
                  boxShadow:
                    "var(--shadow-plate), inset 0 0 0 1px color-mix(in oklab, var(--brass) 34%, transparent)",
                }}
              >
                Ring the shop
              </a>
              <button
                type="button"
                onClick={() => clearList("basket")}
                className="shop-meta rounded-sm px-5 py-3.5 text-brass/70 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass/60"
              >
                Clear the counter
              </button>
            </div>
          </div>
          {!allLive ? (
            <p className="mt-4 text-sm leading-6 text-foreground/55">
              Example items are display-only. Ring the shop for current availability.
            </p>
          ) : null}
        </>
      )}
    </ShopPage>
  );
}

function normalizeRoom(value: string): StockItem["room"] {
  if (value === "arcade" || value === "sound-vision" || value === "curiosity") return value;
  return "library";
}
