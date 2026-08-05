import { createFileRoute, Link } from "@tanstack/react-router";

import { ListRow } from "@/components/shop/ListRow";
import { ShopPage } from "@/components/shop/ShopPage";
import { STOCK } from "@/data/stock";
import { clearList, removeFrom, useList } from "@/lib/shop-lists";

const TITLE = "Keeping an eye out — Bookmart & GameXchange";
const DESCRIPTION =
  "The list we are watching for you at Bookmart & GameXchange in Dublin 1. Second-hand books, games, records and films.";

export const Route = createFileRoute("/wishlist")({
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
  component: Wishlist,
});

function Wishlist() {
  const ids = useList("wishlist");
  const items = ids
    .map((id) => STOCK.find((item) => item.id === id))
    .filter((item): item is (typeof STOCK)[number] => Boolean(item));

  return (
    <ShopPage
      eyebrow="Noted at the counter"
      title="Keeping an eye out"
      intro="Things you have asked us to watch for. When one comes over the counter we set it aside."
    >
      {items.length === 0 ? (
        <div
          className="rounded-sm bg-timber-deep/65 p-6 sm:p-8"
          style={{ boxShadow: "var(--shadow-plate)" }}
        >
          <p className="text-[0.95rem] leading-[1.7] text-foreground/70">
            Nothing on the list yet. Ask us to keep an eye out from any item in the shop.
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
                removeLabel="Stop watching"
                onRemove={() => removeFrom("wishlist", item.id)}
              />
            ))}
          </ul>
          <button
            type="button"
            onClick={() => clearList("wishlist")}
            className="shop-meta mt-8 rounded-sm px-5 py-3.5 text-brass/70 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass/60"
          >
            Clear the list
          </button>
        </>
      )}
    </ShopPage>
  );
}
