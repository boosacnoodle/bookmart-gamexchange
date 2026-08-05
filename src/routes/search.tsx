import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { SearchField } from "@/components/shop/SearchField";
import { ShopBar } from "@/components/shop/ShopBar";
import { StockCard } from "@/components/shop/StockCard";
import { TradeCounter } from "@/components/shop/TradeCounter";
import { ROOMS } from "@/data/rooms";
import { searchStock } from "@/data/stock";
import { searchInventory } from "@/lib/catalog.server";

const TITLE = "Search the shop — Bookmart & GameXchange";
const DESCRIPTION =
  "Search every room of the shop at once: books, games, records, films and oddities. Results are grouped by the room they live in.";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string).slice(0, 120) : "",
  }),
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: ({ deps }) => searchInventory({ data: { query: deps.q } }),
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
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const liveResults = Route.useLoaderData();
  const results = useMemo(() => [...liveResults, ...searchStock(q)], [liveResults, q]);

  const grouped = useMemo(
    () =>
      ROOMS.map((room) => ({
        room,
        items: results.filter((item) => item.room === room.id),
      })).filter((group) => group.items.length > 0),
    [results],
  );

  return (
    <div className="min-h-screen bg-ink">
      <ShopBar />
      <main className="animate-walk-in">
        <section className="mx-auto max-w-[1800px] px-6 pt-28 pb-10 sm:px-8">
          <p className="pixel-label text-brass/70">Ask at the counter</p>
          <h1 className="sign-plate mt-2.5 text-[clamp(1.7rem,4vw,2.5rem)] leading-[1.12] text-lamplight">
            Search the whole shop
          </h1>
          <p className="measure mt-4 text-[0.92rem] leading-[1.7] text-foreground/70">
            One building, four rooms. We will tell you which room to walk into.
          </p>
          <SearchField initial={q} className="mt-7 max-w-xl" />

          {q ? (
            <p className="shop-meta mt-6 text-brass/60">
              {results.length} {results.length === 1 ? "item" : "items"} for &ldquo;{q}&rdquo;
            </p>
          ) : null}
        </section>

        {q && grouped.length === 0 ? (
          <section className="mx-auto max-w-[1800px] px-6 pb-16 sm:px-8">
            <p className="measure text-sm leading-[1.7] text-muted-foreground">
              Nothing on the shelves under that name today. Stock changes daily — try a shorter
              search, walk into a room and browse, or ask at the Trade Counter and we will watch out
              for it.
            </p>
            <nav aria-label="Rooms" className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
              {ROOMS.map((room) => (
                <Link
                  key={room.id}
                  to={room.href}
                  className="shop-meta text-brass/70 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
                >
                  {room.name} &rarr;
                </Link>
              ))}
            </nav>
          </section>
        ) : null}

        {grouped.map(({ room, items }) => (
          <section
            key={room.id}
            aria-label={`Found in ${room.name}`}
            className="mx-auto max-w-[1800px] px-6 pb-14 sm:px-8"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="sign-plate text-[1.25rem] leading-[1.2] text-lamplight/90">
                Found in {room.name}
              </h2>
              <Link
                to={room.href}
                className="shop-meta text-brass/65 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
              >
                Walk into the room &rarr;
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <StockCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}

        <TradeCounter />
      </main>
    </div>
  );
}
