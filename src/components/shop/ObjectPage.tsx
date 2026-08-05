import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { ShopBar } from "@/components/shop/ShopBar";
import { StockCard } from "@/components/shop/StockCard";
import { TradeCounter } from "@/components/shop/TradeCounter";
import type { Room } from "@/data/rooms";
import {
  availability,
  availabilityLabel,
  catalogueRef,
  conditionMarks,
  foundNearby,
  itemPath,
  objectDetails,
  objectGallery,
  objectSpecs,
  shopkeeperNote,
} from "@/data/objects";
import { SHOP } from "@/data/shop";
import { formatPrice, formatTraded, type StockItem } from "@/data/stock";
import { addTo, removeFrom, toggleIn, useList } from "@/lib/shop-lists";

/**
 * One object, on the counter, under the lamp. The room stays softly behind it
 * so nobody feels they have left the building to look at a thing.
 */
export function ObjectPage({ room, item }: { room: Room; item: StockItem }) {
  const note = shopkeeperNote(item);
  const marks = conditionMarks(item);
  const nearby = foundNearby(item);
  const state = availability(item);
  const specs = objectSpecs(item);
  const details = objectDetails(item);

  return (
    <div className="relative min-h-screen bg-ink">
      <ShopBar />

      {/* The room, still there, just turned down. */}
      <img
        src={room.image}
        alt=""
        aria-hidden="true"
        width={1280}
        height={960}
        className="pointer-events-none fixed inset-0 -z-20 h-full w-full object-cover opacity-[0.18]"
      />
      <div
        aria-hidden="true"
        className="scene-grade pointer-events-none fixed inset-0 -z-20 opacity-70"
        style={{ background: room.grade }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          background: `radial-gradient(30rem 24rem at 50% 30%, color-mix(in oklab, ${room.glow} 22%, transparent), transparent 74%), linear-gradient(to bottom, color-mix(in oklab, var(--ink) 62%, transparent), color-mix(in oklab, var(--ink) 88%, transparent))`,
        }}
      />

      <main className="animate-walk-in mx-auto max-w-[1400px] px-6 pt-24 pb-16 sm:px-8">
        <nav
          aria-label="Where you are"
          className="flex flex-wrap items-center gap-x-3 gap-y-2 text-brass/60"
        >
          <Link
            to="/"
            className="shop-meta inline-flex items-center gap-2 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            The street
          </Link>
          <span aria-hidden="true" className="shop-meta text-foreground/25">
            /
          </span>
          <Link
            to={room.href}
            className="shop-meta transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
          >
            {room.name}
          </Link>
          <span aria-hidden="true" className="shop-meta text-foreground/25">
            /
          </span>
          <Link
            to={room.href}
            search={{ shelf: item.shelf }}
            className="shop-meta transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
          >
            {item.shelf}
          </Link>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          {/* Placed on the counter */}
          <Gallery item={item} room={room} />

          {/* The card that comes with it */}
          <div className="lg:pt-2">
            <p className="pixel-label text-brass/60">{item.maker}</p>
            <h1 className="sign-plate mt-3 text-[clamp(1.6rem,3.4vw,2.4rem)] leading-[1.15] text-lamplight">
              {item.title}
              {item.year ? <span className="text-foreground/45"> · {item.year}</span> : null}
            </h1>

            <div className="mt-7 flex flex-wrap items-center gap-5">
              <PriceTag value={item.price} />
              <p className="shop-meta text-brass/65">{availabilityLabel(item)}</p>
            </div>

            <p className="measure mt-7 text-[0.95rem] leading-[1.75] text-foreground/75">
              {item.note}
            </p>

            <section aria-label="Condition" className="mt-9">
              <h2 className="shop-meta text-brass/55">Condition</h2>
              <p className="sign-plate mt-2 text-[1.1rem] text-lamplight/90">{item.condition}</p>
              {marks.length > 0 ? (
                <ul className="mt-3 space-y-1.5">
                  {marks.map((mark) => (
                    <li
                      key={mark}
                      className="measure text-[0.86rem] leading-[1.6] text-foreground/55 italic"
                    >
                      {mark}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            {note ? (
              <section
                aria-label="Shopkeeper's Note"
                className="mt-9 rounded-sm bg-timber-deep/55 p-6"
                style={{
                  boxShadow:
                    "var(--shadow-plate), inset 0 0 0 1px color-mix(in oklab, var(--brass) 20%, transparent)",
                }}
              >
                <h2 className="shop-meta text-brass/60">Shopkeeper&rsquo;s Note</h2>
                <p className="measure mt-3 text-[0.95rem] leading-[1.8] text-lamplight/80">
                  {note}
                </p>
              </section>
            ) : null}

            {specs.length > 0 ? (
              <dl aria-label="About this copy" className="mt-9 grid grid-cols-2 gap-y-4">
                {specs.map((spec) => (
                  <Fact key={spec.label} label={spec.label} value={spec.value} />
                ))}
              </dl>
            ) : null}

            <dl className="mt-4 grid grid-cols-2 gap-y-4">
              <Fact label="Shelf" value={`${item.shelf}, ${room.name}`} />
              <Fact label="Came in" value={formatTraded(item.traded)} />
            </dl>

            <CounterActions item={item} sold={state === "sold"} reserved={state === "reserved"} />

            <TakeItHome item={item} sold={state === "sold"} />

            <Enquiry item={item} room={room} />

            <SmallPrint details={details} />
          </div>
        </div>

        {nearby.length > 0 ? (
          <section aria-label="Found nearby" className="pt-20">
            <h2 className="sign-plate text-[1.2rem] leading-[1.2] text-lamplight/90">
              Found nearby
            </h2>
            <p className="measure mt-2 text-[0.86rem] leading-[1.7] text-foreground/55">
              On the same shelf, or a step along the wall in {room.name}.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nearby.map((other) => (
                <StockCard key={other.id} item={other} />
              ))}
            </div>
          </section>
        ) : null}

        <p className="shop-meta mt-14 text-brass/50">
          <Link
            to={room.href}
            className="transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
          >
            Put it back on the shelf
          </Link>
        </p>
      </main>

      <TradeCounter />
    </div>
  );
}

function PriceTag({ value }: { value: number }) {
  return (
    <span
      className="relative inline-flex items-center rounded-[2px] bg-[color-mix(in_oklab,var(--lamplight)_82%,var(--timber))] px-4 py-1.5 pl-7"
      style={{ boxShadow: "0 1px 10px -6px oklch(0 0 0 / 0.8)" }}
    >
      <span
        aria-hidden="true"
        className="absolute left-3 h-1.5 w-1.5 rounded-full bg-ink/35 ring-1 ring-ink/20"
      />
      <span className="sign-plate text-[1.15rem] leading-none text-ink/85">
        {formatPrice(value)}
      </span>
    </span>
  );
}

/**
 * Three photographs of the one copy. Turning it over in your hands, not a
 * carousel: the plate stays put and the small plates below swap what is on it.
 */
function Gallery({ item, room }: { item: StockItem; room: Room }) {
  const views = objectGallery(item);
  const [index, setIndex] = useState(0);
  const view = views[index]!;

  return (
    <figure className="m-0">
      <div
        className="grain relative overflow-hidden rounded-sm bg-timber-deep/70"
        style={{ boxShadow: "var(--shadow-plate)" }}
      >
        <img
          key={view.src}
          src={view.src}
          alt={`${item.title} by ${item.maker} — ${view.label.toLowerCase()} at Bookmart & GameXchange`}
          width={1280}
          height={960}
          className="h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(18rem 14rem at 50% 44%, color-mix(in oklab, ${room.glow} 16%, transparent), transparent 72%)`,
            mixBlendMode: "soft-light",
          }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        {views.map((other, i) => (
          <button
            key={other.src}
            type="button"
            aria-label={other.label}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className="group relative h-16 w-24 shrink-0 overflow-hidden rounded-[2px] transition-opacity duration-200 ease-[var(--ease-brass)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
            style={{
              boxShadow:
                i === index
                  ? "inset 0 0 0 1px color-mix(in oklab, var(--brass) 60%, transparent)"
                  : "inset 0 0 0 1px color-mix(in oklab, var(--brass) 18%, transparent)",
            }}
          >
            <img
              src={other.src}
              alt=""
              aria-hidden="true"
              loading="lazy"
              width={1280}
              height={960}
              className={`h-full w-full object-cover transition-[opacity,filter] duration-200 ease-[var(--ease-brass)] ${
                i === index
                  ? "opacity-100"
                  : "opacity-55 brightness-[0.7] group-hover:opacity-90 group-hover:brightness-100"
              }`}
            />
          </button>
        ))}
      </div>

      <figcaption aria-live="polite" className="shop-meta mt-3 text-foreground/40">
        {view.caption}
      </figcaption>
    </figure>
  );
}

/** Collect it off the shelf, or we wrap it and post it. */
function TakeItHome({ item, sold }: { item: StockItem; sold: boolean }) {
  return (
    <section aria-label="Getting it home" className="mt-10 border-t border-brass/12 pt-7">
      <h2 className="shop-meta text-brass/55">Getting it home</h2>
      <ul className="mt-4 space-y-4">
        {item.clickCollectEligible !== false ? (
          <li>
            <p className="sign-plate text-[1rem] text-lamplight/85">Click &amp; collect — free</p>
            <p className="measure mt-1 text-[0.86rem] leading-[1.6] text-foreground/60">
              {sold
                ? `Gone from ${item.shelf}, but ask and we will watch for another.`
                : `Held at the counter for three days. ${SHOP.street}, ${SHOP.city} — ${SHOP.closingLine.toLowerCase()}.`}
            </p>
          </li>
        ) : null}
        {item.deliveryEligible !== false && !item.collectionOnly ? (
          <li>
            <p className="sign-plate text-[1rem] text-lamplight/85">
              Posted in Ireland — calculated at checkout
            </p>
            <p className="measure mt-1 text-[0.86rem] leading-[1.6] text-foreground/60">
              Carefully packed and sent to an Irish address.
            </p>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

/** Ask us about it. A real email, already half-written for you. */
function Enquiry({ item, room }: { item: StockItem; room: Room }) {
  const subject = `About ${item.title} (${catalogueRef(item)})`;
  const body = `Hello,\n\nI have a question about ${item.title}${
    item.year ? ` (${item.year})` : ""
  } on the ${item.shelf} shelf in ${room.name}, reference ${catalogueRef(item)}.\n\n`;
  const href = `${SHOP.emailHref}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <section aria-label="Ask about this item" className="mt-10">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <a
          href={href}
          className="shop-meta rounded-sm px-5 py-3.5 text-brass/75 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass/60"
          style={{
            boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--brass) 22%, transparent)",
          }}
        >
          Ask about this item
        </a>
        <a
          href={SHOP.phoneHref}
          className="shop-meta py-3 text-foreground/50 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
        >
          Or ring the shop — {SHOP.phone}
        </a>
      </div>
      <p className="measure mt-3 text-[0.86rem] leading-[1.6] text-foreground/50">
        Somebody who has actually held this copy will answer, usually the same day.
      </p>
    </section>
  );
}

/** The number on the back. Present, findable, never the loudest thing here. */
function SmallPrint({ details }: { details: { label: string; value: string }[] }) {
  return (
    <details className="group mt-9 border-t border-brass/12 pt-6">
      <summary className="shop-meta cursor-pointer list-none text-brass/45 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-brass/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass/50">
        <span className="inline-flex items-center gap-2">
          The card in the drawer
          <span aria-hidden="true" className="transition-transform group-open:rotate-90">
            ›
          </span>
        </span>
      </summary>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
        {details.map((detail) => (
          <div key={detail.label} className="min-w-0">
            <dt className="shop-meta text-brass/40">{detail.label}</dt>
            <dd className="mt-1 text-[0.8rem] leading-[1.55] break-words text-foreground/55">
              {detail.value}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="shop-meta text-brass/50">{label}</dt>
      <dd className="mt-1 text-[0.86rem] leading-[1.6] text-foreground/70">{value}</dd>
    </div>
  );
}

/**
 * Placing something on the counter, and asking us to keep an eye out.
 * Deliberately quiet: one line of confirmation, nothing flies anywhere.
 */
function CounterActions({
  item,
  sold,
  reserved,
}: {
  item: StockItem;
  sold: boolean;
  reserved: boolean;
}) {
  const basket = useList("basket");
  const listKey = item.slug ?? item.id;
  const watching = useList("wishlist").includes(listKey);
  const onCounter = basket.includes(listKey);
  const exampleOnly = !item.slug;

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={sold || exampleOnly}
          onClick={() => (onCounter ? removeFrom("basket", listKey) : addTo("basket", listKey))}
          className="shop-meta rounded-sm bg-timber/85 px-6 py-3.5 text-lamplight transition-[box-shadow,color] duration-200 ease-[var(--ease-brass)] hover:text-lamplight disabled:cursor-not-allowed disabled:text-foreground/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
          style={{
            boxShadow:
              "var(--shadow-plate), inset 0 0 0 1px color-mix(in oklab, var(--brass) 34%, transparent)",
          }}
        >
          {sold
            ? "Sold"
            : exampleOnly
              ? "Example item"
              : onCounter
                ? "On the counter — take it back off"
                : "Place on the counter"}
        </button>

        <button
          type="button"
          onClick={() => toggleIn("wishlist", listKey)}
          className="shop-meta rounded-sm px-5 py-3.5 text-brass/70 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass/60"
        >
          {watching ? "We’re keeping an eye out" : "Ask us to keep an eye out"}
        </button>
      </div>

      <p aria-live="polite" className="shop-meta mt-3 min-h-[1.2em] text-foreground/45">
        {exampleOnly
          ? "This sample shows how a real listing will look. Ask the shop about current stock."
          : sold
            ? "This one has gone. Ask and we will watch for another."
            : reserved
              ? "Held for somebody until Friday. Ask at the counter."
              : onCounter
                ? "Left on the counter for you."
                : watching
                  ? "Noted at the counter."
                  : ""}
      </p>
    </div>
  );
}
