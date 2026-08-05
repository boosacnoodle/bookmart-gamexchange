import { Link } from "@tanstack/react-router";

import { availabilityLabel, itemPath } from "@/data/objects";
import { formatPrice, formatTraded, type StockItem } from "@/data/stock";

/**
 * One item on a shelf. Everything is second-hand, so the condition note and
 * the day it came in are as much a part of the item as the price.
 */
export function StockCard({ item }: { item: StockItem }) {
  return (
    <article
      className="group relative flex flex-col rounded-sm bg-timber-deep/65 p-5 transition-[box-shadow,transform] duration-200 ease-[var(--ease-brass)] hover:-translate-y-px hover:shadow-[var(--shadow-plate),0_0_0_1px_color-mix(in_oklab,var(--brass)_26%,transparent)_inset]"
      style={{ boxShadow: "var(--shadow-plate)" }}
    >
      <p className="pixel-label text-brass/60">{item.maker}</p>
      <h3 className="sign-plate mt-2 text-[1.05rem] leading-[1.3] text-lamplight/95">
        <Link
          to={itemPath(item)}
          className="transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass/60"
        >
          {/* The whole card is the reach; the title carries the link. */}
          <span aria-hidden="true" className="absolute inset-0 rounded-sm" />
          {item.title}
          {item.year ? <span className="text-foreground/45"> · {item.year}</span> : null}
        </Link>
      </h3>
      <p className="mt-3 flex-1 text-[0.83rem] leading-[1.65] text-foreground/65">{item.note}</p>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="shop-meta text-brass/60">{item.condition}</p>
          <p className="mt-1.5 text-[0.72rem] leading-[1.5] text-muted-foreground/75">
            Traded in {formatTraded(item.traded)}
          </p>
        </div>
        <p className="sign-plate shrink-0 text-[1.1rem] text-brass">{formatPrice(item.price)}</p>
      </div>

      <p className="shop-meta mt-4 text-foreground/40">{availabilityLabel(item)}</p>
    </article>
  );
}