import type { ReactNode } from "react";

import { ShopBar } from "@/components/shop/ShopBar";
import { TradeCounter } from "@/components/shop/TradeCounter";

/**
 * A room without artwork: the counter, the back office, the watch list.
 * Same building, same lamplight, just plainer walls.
 */
export function ShopPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-ink">
      <ShopBar />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(34rem 26rem at 50% 0%, color-mix(in oklab, var(--lamplight) 12%, transparent), transparent 72%)",
        }}
      />
      <main className="animate-walk-in mx-auto max-w-[1200px] px-5 pt-20 pb-14 sm:px-8 sm:pt-24 sm:pb-16">
        <p className="pixel-label text-brass/65">{eyebrow}</p>
        <h1 className="sign-plate mt-3 text-[clamp(1.6rem,5vw,2.5rem)] leading-[1.14] text-lamplight">
          {title}
        </h1>
        {intro ? (
          <p className="measure mt-4 text-[0.95rem] leading-[1.7] text-foreground/70">{intro}</p>
        ) : null}
        <div className="mt-10">{children}</div>
      </main>
      <TradeCounter />
    </div>
  );
}
