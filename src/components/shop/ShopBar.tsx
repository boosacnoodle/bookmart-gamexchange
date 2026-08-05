import { Link } from "@tanstack/react-router";
import { Heart, KeyRound, ShoppingBag } from "lucide-react";

import { useList } from "@/lib/shop-lists";

/**
 * The shop's brass rail. Always present, never in the way.
 * Every fitting on it goes somewhere: the door, the counter, the watch list.
 */
export function ShopBar() {
  const basket = useList("basket");
  const wishlist = useList("wishlist");

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 bg-ink/85 backdrop-blur-md"
      style={{
        boxShadow:
          "0 1px 0 color-mix(in oklab, var(--brass) 16%, transparent), 0 8px 24px -18px oklch(0 0 0 / 0.9)",
      }}
    >
      <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-4 py-2 sm:gap-4 sm:px-8 sm:py-3">
        <Link
          to="/"
          aria-label="Bookmart & GameXchange, home"
          className="flex min-h-11 min-w-0 items-center gap-2"
        >
          <span className="sign-plate truncate text-[0.95rem] leading-none text-lamplight transition-colors duration-200 ease-[var(--ease-brass)] sm:text-base">
            Bookmart
          </span>
          <span className="pixel-label hidden text-brass/70 sm:inline">&amp; GameXchange</span>
        </Link>

        <nav aria-label="The counter" className="flex shrink-0 items-center gap-0.5 text-brass/75">
          <Link
            to="/staff"
            aria-label="Admin login"
            className="mr-1 inline-flex min-h-11 items-center gap-2 rounded-sm border border-brass/25 bg-timber-deep/70 px-3 text-[0.68rem] font-semibold tracking-[0.12em] text-lamplight uppercase transition-[border-color,background-color,color] duration-200 ease-[var(--ease-brass)] hover:border-brass/50 hover:bg-timber-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass/60 sm:px-4 sm:text-xs"
          >
            <KeyRound className="h-3.5 w-3.5 text-brass" aria-hidden="true" />
            Admin
          </Link>
          <IconLink to="/wishlist" label="Keeping an eye out" count={wishlist.length}>
            <Heart className="h-[1.1rem] w-[1.1rem]" />
          </IconLink>
          <IconLink to="/basket" label="On the counter" count={basket.length}>
            <ShoppingBag className="h-[1.1rem] w-[1.1rem]" />
          </IconLink>
        </nav>
      </div>
    </header>
  );
}

function IconLink({
  to,
  label,
  count = 0,
  children,
}: {
  to: string;
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-label={count ? `${label} (${count})` : label}
      title={label}
      activeProps={{ "aria-current": "page" }}
      className="group relative grid h-11 w-11 place-items-center rounded-full transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brass/60 aria-[current=page]:text-lamplight"
    >
      <span className="block transition-[filter] duration-200 ease-[var(--ease-brass)] group-hover:drop-shadow-[0_0_6px_color-mix(in_oklab,var(--lamplight)_55%,transparent)]">
        {children}
      </span>
      {count > 0 ? (
        <span className="pixel-label absolute top-1 right-1 min-w-[1.05rem] rounded-full bg-brass/85 px-1 text-center text-[0.55rem] leading-[1.05rem] text-ink">
          {count}
        </span>
      ) : null}
      {/* Current page: a lit brass underline that draws itself */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-3 bottom-1.5 h-px origin-center scale-x-0 bg-brass/70 transition-transform duration-200 ease-[var(--ease-brass)] group-aria-[current=page]:scale-x-100"
      />
    </Link>
  );
}
