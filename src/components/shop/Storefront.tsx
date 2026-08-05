import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import storefrontWide from "@/assets/storefront-pixel.png";
import storefrontPortrait from "@/assets/storefront-pixel-portrait.png";
import { SHOP } from "@/data/shop";

/**
 * The shopfront, drawn in pixel art. Everything interactive is a place in the
 * picture — the mat, the two windows, the A-board, the doorway — never a
 * control floating on top of it. Lighting is the interface: attention warms
 * one part of the building and quietens the rest.
 */

type Hotspot = {
  id: string;
  label: string;
  /** Where the light gathers, in image space. */
  glow: string;
  /** Portrait crop first, wide crop from md up. */
  box: string;
};

const HOTSPOTS: Hotspot[] = [
  {
    id: "doorway",
    label: "Come on in",
    glow: "var(--lamplight)",
    box: "left-[28%] top-[36%] h-[42%] w-[44%] lg:left-[40%] lg:top-[36%] lg:h-[48%] lg:w-[20%] landscape:left-[40%] landscape:top-[36%] landscape:h-[48%] landscape:w-[20%]",
  },
  {
    id: "mat",
    label: "Come on in",
    glow: "var(--lamplight)",
    box: "left-[30%] top-[74%] h-[11%] w-[40%] lg:left-[41.5%] lg:top-[79%] lg:h-[10%] lg:w-[17%] landscape:left-[41.5%] landscape:top-[79%] landscape:h-[10%] landscape:w-[17%]",
  },
  {
    id: "games",
    label: "Retro games window",
    glow: "var(--neon-open)",
    box: "left-[74%] top-[38%] h-[36%] w-[20%] lg:left-[64%] lg:top-[36%] lg:h-[44%] lg:w-[19%] landscape:left-[64%] landscape:top-[36%] landscape:h-[44%] landscape:w-[19%]",
  },
  {
    id: "books",
    label: "Books window",
    glow: "var(--brass)",
    box: "left-[8%] top-[38%] h-[36%] w-[18%] lg:left-[22%] lg:top-[36%] lg:h-[44%] lg:w-[16%] landscape:left-[22%] landscape:top-[36%] landscape:h-[44%] landscape:w-[16%]",
  },
  {
    id: "board",
    label: "Buy, sell, trade",
    glow: "var(--glass-green)",
    box: "left-[6%] top-[63%] h-[14%] w-[16%] lg:hidden landscape:hidden",
  },
  {
    id: "map",
    label: "Find Bookmart at 73 Talbot Street, Dublin 1",
    glow: "var(--glass-green)",
    box: "hidden lg:block lg:left-[12.5%] lg:top-[63%] lg:h-[24%] lg:w-[10%] landscape:left-[12.5%] landscape:top-[63%] landscape:block landscape:h-[24%] landscape:w-[10%]",
  },
];

const GLOW_CENTRES: Record<string, string> = {
  doorway: "50% 58%",
  mat: "50% 84%",
  games: "73% 55%",
  books: "30% 55%",
  board: "17% 74%",
  map: "17% 74%",
};

export function Storefront({ onEnter }: { onEnter: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const frame = useRef<number | null>(null);
  const [lit, setLit] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const move = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    if (frame.current) cancelAnimationFrame(frame.current);
    const { clientX, clientY } = e;
    frame.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty("--my", `${((clientY - rect.top) / rect.height) * 100}%`);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setLit(true), 120);
    return () => clearTimeout(t);
  }, []);

  const toTrade = useCallback(() => {
    document
      .getElementById("trade-counter")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const act = (id: string) => {
    if (id === "board") return toTrade();
    if (id === "map") {
      window.open(SHOP.maps, "_blank", "noopener,noreferrer");
      return;
    }
    if (id === "books") return void navigate({ to: "/library" });
    if (id === "games") return void navigate({ to: "/arcade" });
    onEnter();
  };

  const activeGlow = active ? HOTSPOTS.find((h) => h.id === active)?.glow : null;

  return (
    <section
      ref={ref}
      onPointerMove={move}
      onPointerLeave={() => setActive(null)}
      aria-label="Outside the shop"
      className="grain relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink [--mx:50%] [--my:45%]"
    >
      <picture>
        <source media="(min-width: 1024px), (orientation: landscape)" srcSet={storefrontWide} />
        <img
          src={storefrontPortrait}
          alt="Bookmart & GameXchange shopfront in pixel art: brick facade, painted sign, open doors with warm light spilling onto wet cobbles, OPEN and RETRO GAMES neon in the windows"
          width={1920}
          height={1088}
          className="pixelated absolute inset-0 -z-10 h-full w-full object-cover object-center transition-[opacity,transform] duration-[1600ms] ease-[var(--ease-door)]"
          style={{ opacity: lit ? 1 : 0, transform: lit ? "scale(1)" : "scale(1.02)" }}
        />
      </picture>

      {/* Cursor warmth: the building notices you */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
        style={{
          background:
            "radial-gradient(34rem 26rem at var(--mx) var(--my), color-mix(in oklab, var(--lamplight) 16%, transparent), transparent 70%)",
          mixBlendMode: "soft-light",
        }}
      />

      {/* The rest of the street quietens when one part holds attention */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-ink transition-opacity duration-[900ms] ease-[var(--ease-door)]"
        style={{ opacity: active ? 0.3 : 0 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-[900ms] ease-[var(--ease-door)]"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(26rem 22rem at ${
            active ? GLOW_CENTRES[active] : "50% 50%"
          }, color-mix(in oklab, ${activeGlow ?? "var(--lamplight)"} 30%, transparent), transparent 72%)`,
          mixBlendMode: "soft-light",
        }}
      />

      {/* Ambient life: none of it should ask to be looked at. */}
      {/* Interior light leaning out through the open doorway */}
      <div
        aria-hidden="true"
        className="animate-spill pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(18rem 15rem at 50% 62%, color-mix(in oklab, var(--lamplight) 22%, transparent), transparent 70%)",
          mixBlendMode: "soft-light",
        }}
      />
      {/* Lamp bloom, left of the facade */}
      <div
        aria-hidden="true"
        className="animate-lamp pointer-events-none absolute inset-0 -z-10 hidden lg:block"
        style={{
          background:
            "radial-gradient(9rem 9rem at 8.5% 44%, color-mix(in oklab, var(--lamplight) 20%, transparent), transparent 72%)",
          mixBlendMode: "screen",
        }}
      />
      {/* Depth behind the glass: the windows are rooms, not stickers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(11rem 11rem at 30% 55%, color-mix(in oklab, var(--brass) 12%, transparent), transparent 68%), radial-gradient(11rem 11rem at 73% 55%, color-mix(in oklab, var(--neon-open) 10%, transparent), transparent 68%)",
          mixBlendMode: "soft-light",
        }}
      />
      {/* RETRO GAMES neon, misfiring once in a long while */}
      <div
        aria-hidden="true"
        className="animate-flicker pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(6rem 4rem at 73% 47%, color-mix(in oklab, var(--neon-open) 16%, transparent), transparent 72%)",
          mixBlendMode: "screen",
        }}
      />
      {/* Reflection drifting on wet stone */}
      <div
        aria-hidden="true"
        className="animate-sheen pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[22%]"
        style={{
          background:
            "linear-gradient(to top, color-mix(in oklab, var(--lamplight) 14%, transparent), transparent 76%)",
          mixBlendMode: "soft-light",
        }}
      />

      <div
        aria-hidden="true"
        className="scene-seat pointer-events-none absolute inset-0 -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28%] bg-gradient-to-b from-ink/45 to-transparent"
      />

      {/* Places in the picture */}
      {HOTSPOTS.map((h) => (
        <div key={h.id} className="pointer-events-none absolute inset-0 z-10">
          <button
            type="button"
            aria-label={h.label}
            onClick={() => act(h.id)}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setActive(h.id);
            }}
            onFocus={() => setActive(h.id)}
            onBlur={() => setActive(null)}
            className={`pointer-events-auto absolute cursor-pointer rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass/70 ${h.box}`}
            style={{ background: "transparent" }}
            data-hotspot={h.id}
          />
        </div>
      ))}

      {/* The threshold: search, the trade line, the hours. Shop fittings, not chrome. */}
      <div
        className="animate-door-in relative z-20 bg-ink/80 backdrop-blur-[2px]"
        style={{ boxShadow: "0 -1px 0 color-mix(in oklab, var(--brass) 14%, transparent)" }}
      >
        <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-6 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const q = query.trim();
              if (!q) return;
              void navigate({ to: "/search", search: { q } });
            }}
            className="min-w-0 flex-1 lg:max-w-sm"
          >
            <label
              className="flex items-center gap-3 rounded-sm bg-timber-deep/80 px-4 py-3 transition-shadow duration-200 ease-[var(--ease-brass)] focus-within:shadow-[var(--shadow-plate),0_0_0_1px_var(--brass)]"
              style={{ boxShadow: "var(--shadow-plate)" }}
            >
              <Search className="h-4 w-4 shrink-0 text-brass/70" aria-hidden="true" />
              <span className="sr-only">Search the shop</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Books, games, records, ISBNs…"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              />
            </label>
          </form>

          <button
            type="button"
            onClick={toTrade}
            className="pixel-label inline-flex min-h-11 max-w-full items-center self-start text-left text-brass/75 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight lg:self-auto"
          >
            Bring your old ones in &mdash; we buy, sell &amp; trade
          </button>

          <button
            type="button"
            onClick={toTrade}
            aria-label="Opening hours and how to find us"
            className="animate-neon pixel-label inline-flex min-h-11 items-center gap-2 self-start text-neon-open transition-opacity duration-200 ease-[var(--ease-brass)] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass/60 lg:self-auto">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-neon-open shadow-[0_0_10px_1px_var(--neon-open)]"
            />
            Open until 7pm
          </button>
        </div>
      </div>
    </section>
  );
}
