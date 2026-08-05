import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { RoomHero } from "@/components/shop/RoomHero";
import { ShelfRail } from "@/components/shop/ShelfRail";
import { ShopBar } from "@/components/shop/ShopBar";
import { StockCard } from "@/components/shop/StockCard";
import { TradeCounter } from "@/components/shop/TradeCounter";
import type { Room } from "@/data/rooms";
import { ROOM_STOCK_BY_ID, byRecentlyTraded, type StockItem } from "@/data/stock";

const ALL = "Everything";

export function RoomPage({
  room,
  shelf,
  allLabel = ALL,
  shelfHeading = "On the shelves",
  featuredHeading,
  recentHeading = "Recently traded in",
  afterStock,
  inventory,
}: {
  room: Room;
  shelf?: string;
  allLabel?: string;
  shelfHeading?: string;
  featuredHeading?: string;
  recentHeading?: string;
  afterStock?: React.ReactNode;
  inventory?: StockItem[];
}) {
  const navigate = useNavigate();
  const stock = useMemo(
    () => [...(inventory ?? []), ...ROOM_STOCK_BY_ID(room.id)],
    [inventory, room.id],
  );

  const active = shelf && room.shelves.includes(shelf) ? shelf : allLabel;

  const counts = useMemo(() => {
    const result: Record<string, number> = { [allLabel]: stock.length };
    for (const s of room.shelves) {
      result[s] = stock.filter((item) => item.shelf === s).length;
    }
    return result;
  }, [allLabel, room.shelves, stock]);

  const shown: StockItem[] = useMemo(() => {
    const list = active === allLabel ? stock : stock.filter((item) => item.shelf === active);
    return [...list].sort(byRecentlyTraded);
  }, [active, allLabel, stock]);

  const featured = useMemo(
    () =>
      stock
        .filter((item) => item.featured)
        .sort(byRecentlyTraded)
        .slice(0, 3),
    [stock],
  );
  const recent = useMemo(() => [...stock].sort(byRecentlyTraded).slice(0, 4), [stock]);

  const selectShelf = (next: string) => {
    navigate({
      to: room.href,
      search: next === allLabel ? {} : { shelf: next },
      resetScroll: false,
    });
  };

  return (
    <div className="min-h-screen bg-ink">
      <ShopBar />
      <main className="animate-walk-in">
        <RoomHero room={room} count={stock.length}>
          <ShelfRail
            shelves={room.shelves}
            active={active}
            onSelect={selectShelf}
            allLabel={allLabel}
            counts={counts}
          />
        </RoomHero>

        {featuredHeading && featured.length > 0 && active === allLabel ? (
          <section
            aria-label={featuredHeading}
            className="mx-auto max-w-[1800px] px-6 pt-14 sm:px-8"
          >
            <h2 className="sign-plate text-[1.3rem] leading-[1.2] text-lamplight/90">
              {featuredHeading}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item) => (
                <StockCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : null}

        <section
          aria-label={shelfHeading}
          className="mx-auto max-w-[1800px] px-6 pt-14 pb-4 sm:px-8"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="sign-plate text-[1.3rem] leading-[1.2] text-lamplight/90">
              {active === allLabel ? shelfHeading : active}
            </h2>
            <p className="shop-meta text-brass/55">{shown.length} items</p>
          </div>

          {shown.length === 0 ? (
            <p className="measure mt-6 text-sm leading-[1.7] text-muted-foreground">
              This shelf is bare today. Stock turns over quickly — try another shelf, or ask at the
              Trade Counter and we will keep an eye out.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((item) => (
                <StockCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {active === allLabel && recent.length > 0 ? (
          <section
            aria-label={recentHeading}
            className="mx-auto max-w-[1800px] px-6 pt-12 pb-16 sm:px-8"
          >
            <h2 className="sign-plate text-[1.15rem] leading-[1.2] text-lamplight/85">
              {recentHeading}
            </h2>
            <ul className="mt-5 divide-y divide-border/40">
              {recent.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5"
                >
                  <span className="min-w-0 text-[0.9rem] leading-[1.6] text-foreground/80">
                    {item.title}
                    <span className="text-foreground/45"> — {item.maker}</span>
                  </span>
                  <span className="shop-meta text-brass/60">{item.shelf}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {afterStock}
        <TradeCounter />
      </main>
    </div>
  );
}

export const ALL_SHELVES = ALL;
