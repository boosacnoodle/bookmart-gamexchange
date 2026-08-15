import { Link } from "@tanstack/react-router";
import { Bell, MapPin, Clock, Mail } from "lucide-react";

import { SHOP } from "@/data/shop";

/**
 * The Trade Counter is furniture, not navigation. It sits in every room,
 * at the bottom, where a counter would actually be.
 */
export function TradeCounter() {
  return (
    <section
      id="trade-counter"
      aria-label="The Trade Counter"
      className="grain relative scroll-mt-[4rem] bg-timber-deep"
      style={{
        boxShadow:
          "inset 0 1px 0 color-mix(in oklab, var(--brass) 20%, transparent), inset 0 26px 54px -34px oklch(0 0 0 / 0.95)",
        backgroundImage:
          "linear-gradient(to bottom, color-mix(in oklab, var(--timber) 55%, transparent), transparent 42%), repeating-linear-gradient(92deg, oklch(0 0 0 / 0.055) 0 2px, transparent 2px 9px)",
      }}
    >
      <div className="mx-auto grid max-w-[1800px] gap-10 px-6 py-16 sm:px-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-end md:py-20">
        <div className="min-w-0">
          <p className="pixel-label text-brass/70">We buy &amp; trade</p>
          <h2 className="sign-plate mt-3 text-[clamp(1.75rem,4vw,2.6rem)] leading-[1.12] text-lamplight">
            The Trade Counter
          </h2>
          <p className="measure mt-4 text-[0.95rem] leading-[1.7] text-foreground/75">
            Bring in books, games, consoles, vinyl or films. We will look at everything, tell you
            honestly what it is worth, and pay in cash or credit against anything in the shop.
          </p>

          <Link
            to="/trade"
            className="group mt-8 inline-flex items-center gap-3 rounded-sm bg-timber/80 px-7 py-4 text-sm tracking-[0.16em] text-lamplight uppercase transition-[box-shadow,transform,background-color] duration-200 ease-[var(--ease-brass)] hover:bg-timber active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
            style={{ boxShadow: "var(--shadow-counter)" }}
          >
            <Bell className="h-4 w-4 text-brass transition-transform duration-200 ease-[var(--ease-brass)] group-hover:rotate-[9deg]" />
            Ring the bell
          </Link>
        </div>

        <dl className="grid gap-7 text-sm text-foreground/75 sm:grid-cols-3 md:grid-cols-1 md:pb-2 lg:grid-cols-3">
          <div className="flex min-w-0 items-start gap-3">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-brass/70" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="pixel-label text-brass/65">Find us</dt>
              <dd className="mt-2 leading-[1.7]">
                <a
                  href={SHOP.maps}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center break-words py-1 text-lamplight/85 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass/60"
                >
                  {SHOP.street}
                  <br />
                  {SHOP.city}
                  <br />
                  {SHOP.postcode}
                </a>
                <br />
                <a
                  href={SHOP.directions}
                  target="_blank"
                  rel="noreferrer"
                  className="shop-meta mt-1 inline-flex min-h-11 items-center break-all py-1 text-brass/70 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
                >
                  Get directions &rarr;
                </a>
              </dd>
            </div>
          </div>
          <div className="flex min-w-0 items-start gap-3">
            <Clock className="mt-1 h-4 w-4 shrink-0 text-brass/70" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="pixel-label text-brass/65">Open</dt>
              <dd className="mt-2 leading-[1.7]">
                {SHOP.hours.map((slot) => (
                  <span key={slot.days} className="block">
                    {slot.days}
                    <span className="text-foreground/55"> &middot; {slot.time}</span>
                  </span>
                ))}
              </dd>
            </div>
          </div>
          <div className="flex min-w-0 items-start gap-3">
            <Mail className="mt-1 h-4 w-4 shrink-0 text-brass/70" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="pixel-label text-brass/65">Email us</dt>
              <dd className="mt-2 leading-[1.7]">
                <a
                  href={SHOP.emailHref}
                  className="shop-meta mt-1 inline-flex min-h-11 items-center break-all py-1 text-brass/70 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
                >
                  {SHOP.email}
                </a>
              </dd>
            </div>
          </div>
        </dl>
      </div>

      <div
        style={{ boxShadow: "inset 0 1px 0 color-mix(in oklab, var(--brass) 10%, transparent)" }}
      >
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-8">
          <p className="pixel-label text-brass/45">Bookmart &amp; GameXchange &middot; Dublin</p>
          <p className="text-[0.8rem] leading-[1.6] text-muted-foreground/80">
            One copy of everything. Then it is gone.
          </p>
        </div>
      </div>
    </section>
  );
}
