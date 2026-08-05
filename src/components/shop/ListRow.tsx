import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";

import { itemPath } from "@/data/objects";
import { formatPrice, type StockItem } from "@/data/stock";

/** One line on the counter: what it is, what it costs, and a way to put it back. */
export function ListRow({
  item,
  onRemove,
  removeLabel,
}: {
  item: StockItem;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <li
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-sm bg-timber-deep/65 p-4 sm:gap-5 sm:p-5"
      style={{ boxShadow: "var(--shadow-plate)" }}
    >
      <div className="min-w-0">
        <p className="pixel-label truncate text-brass/60">{item.maker}</p>
        <h2 className="sign-plate mt-1.5 text-[1.02rem] leading-[1.3] text-lamplight/95">
          <Link
            to={itemPath(item)}
            className="transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass/60"
          >
            {item.title}
          </Link>
        </h2>
        <p className="shop-meta mt-2 text-foreground/45">{item.condition}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <p className="sign-plate text-[1.05rem] text-brass">{formatPrice(item.price)}</p>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${removeLabel}: ${item.title}`}
          className="grid h-11 w-11 place-items-center rounded-full text-brass/60 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brass/60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
