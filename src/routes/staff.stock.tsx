import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ChoiceRow, Empty, Row, inputClass, inputShadow } from "@/components/staff/StaffKit";
import { StaffShell } from "@/components/staff/StaffShell";
import { getRoom } from "@/data/rooms";
import { formatPrice, STOCK } from "@/data/stock";
import { itemName, usePublished, whenTouched } from "@/lib/staff";

export const Route = createFileRoute("/staff/stock")({
  head: () => ({
    meta: [
      { title: "Stock — Bookmart back office" },
      { name: "description", content: "Everything on the shelves right now." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Stock" },
      { property: "og:description", content: "Everything on the shelves right now." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StockList,
});

const ROOM_FILTERS = ["Everything", "Books", "Games", "Music & Film", "Rare & Collectible"];

function StockList() {
  const published = usePublished();
  const [filter, setFilter] = useState("Everything");
  const [query, setQuery] = useState("");

  const rows = STOCK.filter((item) => {
    const room = getRoom(item.room).name;
    if (filter !== "Everything" && room !== filter) return false;
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    return `${item.title} ${item.maker} ${item.shelf}`.toLowerCase().includes(needle);
  });

  return (
    <StaffShell
      step="Stock"
      title="What's on the shelves"
      intro="One copy of everything, so this is the whole shop."
      back={{ to: "/staff/today", label: "Today" }}
    >
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name, maker or shelf"
        className={inputClass}
        style={inputShadow}
      />

      <div className="mt-4">
        <ChoiceRow options={ROOM_FILTERS} value={filter} onChange={setFilter} />
      </div>

      {published.length > 0 ? (
        <section className="mt-8">
          <h2 className="shop-meta text-brass/55">Added by you today</h2>
          <div className="mt-3 space-y-2">
            {published.map((item) => (
              <Row
                key={item.id}
                title={itemName(item)}
                detail={`${item.shelf} · €${item.price || "0"}`}
                meta={whenTouched(item.updated)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="shop-meta text-brass/55">{rows.length} items</h2>
        <div className="mt-3 space-y-2">
          {rows.length === 0 ? (
            <Empty>Nothing matches that. Try a shorter word.</Empty>
          ) : (
            rows.map((item) => (
              <Row
                key={item.id}
                title={item.title}
                detail={`${item.maker} · ${item.shelf}`}
                meta={formatPrice(item.price)}
              />
            ))
          )}
        </div>
      </section>
    </StaffShell>
  );
}