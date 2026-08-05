import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { ROOMS, type Room } from "@/data/rooms";

/**
 * The room you are stood in. Same artwork, same light as the cross-section on
 * the homepage — the illustration is the environment, the stock lives below it.
 */
export function RoomHero({
  room,
  count,
  children,
}: {
  room: Room;
  count: number;
  children?: React.ReactNode;
}) {
  return (
    <section
      aria-label={room.name}
      className="grain relative isolate flex min-h-[58svh] flex-col justify-end overflow-hidden bg-ink md:min-h-[64svh]"
    >
      <img
        src={room.image}
        alt={`${room.name}: ${room.note}`}
        width={1280}
        height={960}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="scene-grade pointer-events-none absolute inset-0 -z-10 opacity-80"
        style={{ background: room.grade }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(24rem 22rem at 50% 42%, color-mix(in oklab, ${room.glow} 30%, transparent), transparent 72%)`,
          mixBlendMode: "soft-light",
          opacity: 0.4,
        }}
      />
      <div aria-hidden="true" className="scene-seat pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[26%] bg-gradient-to-b from-ink/55 to-transparent"
      />

      <div className="mx-auto w-full max-w-[1800px] px-6 pt-28 pb-9 sm:px-8 md:pb-11">
        <nav
          aria-label="Move through the building"
          className="flex flex-wrap items-center gap-x-6 gap-y-2"
        >
          <Link
            to="/"
            className="shop-meta inline-flex items-center gap-2 text-brass/70 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to the street
          </Link>
          {ROOMS.filter((next) => next.id !== room.id).map((next) => (
            <Link
              key={next.id}
              to={next.href}
              className="shop-meta text-foreground/45 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
            >
              {next.name}
            </Link>
          ))}
        </nav>

        {room.plain ? <p className="pixel-label mt-7 text-brass/70">{room.plain}</p> : null}
        <h1 className="sign-plate mt-2.5 text-[clamp(1.9rem,4.5vw,3rem)] leading-[1.1] text-lamplight">
          {room.name}
        </h1>
        <p className="measure mt-4 text-[0.92rem] leading-[1.7] text-foreground/75">{room.note}</p>
        <p className="shop-meta mt-5 text-brass/60">{count} items on the shelves today</p>
        {children}
      </div>
    </section>
  );
}