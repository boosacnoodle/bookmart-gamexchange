import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, KeyRound } from "lucide-react";

import { ROOMS } from "@/data/rooms";
import { ROOM_STOCK_BY_ID } from "@/data/stock";

/**
 * The cross-section. Four rooms in fixed positions so the plan of the
 * building becomes a memory rather than a menu. Hovering a room raises its
 * light; the others go quieter.
 */
export function Rooms() {
  const [active, setActive] = useState<string | null>(null);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  return (
    <section
      id="inside"
      aria-label="Inside the shop"
      className="relative scroll-mt-[6.5rem] bg-ink sm:scroll-mt-[3.75rem]"
      style={{
        boxShadow:
          "inset 0 1px 0 color-mix(in oklab, var(--brass) 12%, transparent), inset 0 -1px 0 color-mix(in oklab, var(--brass) 12%, transparent)",
      }}
      onPointerLeave={() => setActive(null)}
    >
      <div className="mx-auto max-w-[1800px] px-6 pt-16 pb-6 sm:px-8 md:pt-20 md:pb-8">
        <h2 className="sign-plate text-[clamp(1.55rem,3vw,2.15rem)] leading-[1.15] text-lamplight">
          Four rooms
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4">
        {ROOMS.map((room) => {
          const isActive = canHover && active === room.id;
          const dimmed = canHover && active !== null && active !== room.id;
          return (
            <Link
              key={room.id}
              to={room.href}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setActive(room.id);
              }}
              onFocus={() => setActive(room.id)}
              onBlur={() => setActive(null)}
              className="room-light group relative isolate flex min-h-[68svh] flex-col justify-end overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brass md:min-h-[76svh]"
              style={{
                boxShadow:
                  "inset 1px 0 0 color-mix(in oklab, var(--brass) 9%, transparent), inset 0 0 120px -60px oklch(0 0 0 / 0.9)",
                filter: dimmed
                  ? "brightness(0.5) saturate(0.74)"
                  : isActive
                    ? "brightness(1.09)"
                    : "brightness(1)",
              }}
            >
              <img
                src={room.image}
                alt={`${room.name}: ${room.note}`}
                width={1280}
                height={960}
                loading="lazy"
                decoding="async"
                className="room-light absolute inset-0 -z-10 h-full w-full object-cover"
                style={{
                  transform: isActive ? "scale(1.025)" : "scale(1)",
                }}
              />

              {/* The room's own colour temperature, painted with light */}
              <div
                aria-hidden="true"
                className="scene-grade room-light pointer-events-none absolute inset-0 -z-10"
                style={{ background: room.grade, opacity: isActive ? 0.95 : 0.8 }}
              />

              {/* The room's own light, raised on attention */}
              <div
                aria-hidden="true"
                className="room-light pointer-events-none absolute inset-0 -z-10"
                style={{
                  background: `radial-gradient(24rem 22rem at 50% 42%, color-mix(in oklab, ${room.glow} 30%, transparent), transparent 72%)`,
                  mixBlendMode: "soft-light",
                  opacity: isActive ? 1 : 0.25,
                }}
              />
              <div
                aria-hidden="true"
                className="scene-seat pointer-events-none absolute inset-0 -z-10"
              />

              <div className="relative p-7 sm:p-8">
                <h3 className="sign-plate text-[1.6rem] leading-[1.15] text-lamplight sm:text-[1.8rem]">
                  {room.name}
                </h3>

                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                  {room.tags.map((tag) => (
                    <li key={tag} className="shop-meta text-brass/65">
                      {tag}
                    </li>
                  ))}
                </ul>

                <p className="shop-meta mt-4 text-foreground/40">
                  {ROOM_STOCK_BY_ID(room.id).length} items
                </p>

                <span className="shop-meta mt-6 inline-flex items-center gap-2 tracking-[0.2em] text-lamplight/90">
                  Browse
                  <ArrowRight className="h-3.5 w-3.5 text-brass transition-transform duration-200 ease-[var(--ease-brass)] group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* The Archive: not a room. A locked case at the back of the Library. */}
      <div className="mx-auto max-w-[1800px] px-6 py-14 sm:px-8 md:py-16">
        <Link
          to="/library"
          hash="archive"
          className="group relative isolate flex flex-col gap-5 overflow-hidden rounded-sm bg-timber-deep/70 p-7 transition-shadow duration-200 ease-[var(--ease-brass)] hover:shadow-[var(--shadow-case),0_0_0_1px_color-mix(in_oklab,var(--brass)_34%,transparent)_inset] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass sm:flex-row sm:items-center sm:justify-between sm:p-9"
          style={{ boxShadow: "var(--shadow-case)" }}
        >
          {/* Aged paper behind the glass */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.55]"
            style={{
              background:
                "radial-gradient(30rem 16rem at 20% 0%, color-mix(in oklab, var(--brass) 7%, transparent), transparent 70%), repeating-linear-gradient(96deg, oklch(0 0 0 / 0.05) 0 1px, transparent 1px 7px)",
            }}
          />
          {/* A single fall of light across the pane */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-40 transition-opacity duration-200 ease-[var(--ease-brass)] group-hover:opacity-60"
            style={{
              background:
                "linear-gradient(104deg, transparent 24%, color-mix(in oklab, var(--lamplight) 9%, transparent) 34%, transparent 46%)",
            }}
          />
          <div className="flex min-w-0 items-start gap-4">
            <KeyRound className="mt-0.5 h-[1.1rem] w-[1.1rem] shrink-0 text-brass/70 transition-[transform,color] duration-200 ease-[var(--ease-brass)] group-hover:-rotate-12 group-hover:text-brass" />
            <div className="min-w-0">
              <p className="pixel-label text-brass/65">At the back of the shop</p>
              <h3 className="sign-plate mt-2 text-[1.35rem] leading-[1.2] text-lamplight/90 transition-colors duration-200 ease-[var(--ease-brass)] group-hover:text-lamplight">
                The Archive
              </h3>
              <p className="measure mt-3 text-[0.875rem] leading-[1.7] text-muted-foreground">
                A locked glass cabinet. First editions, signed copies and books we
                had to think twice about selling. Ask and we will open it.
              </p>
            </div>
          </div>
          <span className="shop-meta shrink-0 self-start tracking-[0.2em] text-brass/70 transition-colors duration-200 ease-[var(--ease-brass)] group-hover:text-lamplight sm:self-auto">
            Unlock &rarr;
          </span>
        </Link>
      </div>
    </section>
  );
}
