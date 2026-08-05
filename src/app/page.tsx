"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bell, Clock, Heart, MapPin, Phone, Search, ShoppingBag, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./storefront-home.module.css";

const mapsHref =
  "https://www.google.com/maps/search/?api=1&query=Bookmart%20%26%20Game%20Exchange%2073%20Talbot%20Street%20Dublin%201%20D01%20TW28";

const rooms = [
  {
    label: "Books",
    showLabel: true,
    href: "/books",
    image: "/lovable/room-library.jpg",
    tags: ["Fiction", "Non-fiction", "Irish Writing"],
    count: "13 items",
    glow: "var(--lamp)",
    grade:
      "radial-gradient(20rem 16rem at 46% 40%, rgba(72, 255, 128, 0.14), transparent 70%), linear-gradient(to bottom, rgba(223, 158, 78, 0.16), rgba(7, 7, 9, 0.46))"
  },
  {
    label: "Games",
    showLabel: false,
    href: "/games",
    image: "/lovable/room-arcade.jpg",
    tags: ["Nintendo", "PlayStation", "Xbox"],
    count: "14 items",
    glow: "#54df88",
    grade:
      "radial-gradient(10rem 14rem at 12% 46%, rgba(255, 78, 52, 0.15), transparent 68%), radial-gradient(10rem 14rem at 52% 44%, rgba(68, 162, 255, 0.16), transparent 68%), radial-gradient(10rem 14rem at 84% 44%, rgba(75, 255, 116, 0.12), transparent 68%)"
  },
  {
    label: "Music & Film",
    showLabel: false,
    href: "/music-film",
    image: "/lovable/room-sound-vision.jpg",
    tags: ["Vinyl", "CDs", "DVD & Blu-ray"],
    count: "14 items",
    glow: "#f08b3e",
    grade:
      "radial-gradient(16rem 14rem at 52% 52%, rgba(240, 143, 59, 0.2), transparent 70%), linear-gradient(to bottom, rgba(255, 219, 142, 0.08), transparent 60%)"
  },
  {
    label: "Rare & Collectible",
    showLabel: false,
    href: "/rare-collectible",
    image: "/lovable/room-curiosity.jpg",
    tags: ["Rare Books", "Figures", "Curiosities"],
    count: "13 items",
    glow: "#e5b85f",
    grade:
      "linear-gradient(112deg, rgba(255, 219, 142, 0.12) 0 14%, transparent 26%), radial-gradient(14rem 13rem at 50% 46%, rgba(216, 158, 72, 0.16), transparent 66%), radial-gradient(22rem 20rem at 50% 60%, transparent 40%, rgba(7, 7, 9, 0.5))"
  }
] as const;

const hotspots = [
  { label: "Come on in", target: "inside", className: styles.doorHotspot },
  { label: "Browse books", href: "/books", className: styles.booksHotspot },
  { label: "Browse games", href: "/games", className: styles.gamesHotspot },
  { label: "Sell or trade", target: "trade-counter", className: styles.boardHotspot },
  { label: "Open Bookmart and Game Exchange on Google Maps", href: mapsHref, className: styles.mapHotspot, external: true }
] as const;

export default function HomePage() {
  const [lit, setLit] = useState(false);
  const storefrontRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLit(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className={`${styles.root} lovableStorefrontRoot`}>
      <ShopBar />
      <main>
        <h1 id="home-title" className="sr-only">Bookmart &amp; Game Exchange</h1>
        <section
          ref={storefrontRef}
          aria-label="Outside Bookmart and Game Exchange"
          className={`${styles.storefront} ${lit ? styles.storefrontLit : ""}`}
        >
          <Image
            src="/lovable/storefront-pixel-portrait.png"
            alt="Bookmart and Game Exchange shopfront in pixel art, with warm light spilling from open doors, bookshelves, games, neon signs and wet cobbles."
            fill
            priority
            sizes="100vw"
            className={`${styles.storefrontImage} ${styles.storefrontPortrait}`}
          />
          <Image
            src="/lovable/storefront-pixel-corrected.png"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className={`${styles.storefrontImage} ${styles.storefrontWide}`}
          />

          <div className={styles.storefrontWarmth} aria-hidden="true" />
          <div className={styles.storefrontSeat} aria-hidden="true" />

          {hotspots.map((hotspot) =>
            "href" in hotspot ? (
              <Link
                key={hotspot.label}
                href={hotspot.href}
                aria-label={hotspot.label}
                target={"external" in hotspot && hotspot.external ? "_blank" : undefined}
                rel={"external" in hotspot && hotspot.external ? "noreferrer" : undefined}
                className={`${styles.hotspot} ${hotspot.className}`}
              />
            ) : (
              <button
                key={hotspot.label}
                type="button"
                aria-label={hotspot.label}
                onClick={() => scrollTo(hotspot.target)}
                className={`${styles.hotspot} ${hotspot.className}`}
              />
            )
          )}

          <div className={styles.threshold}>
            <form className={styles.searchForm} action="/search" role="search">
              <label className="sr-only" htmlFor="storefront-search">Search the shop</label>
              <Search aria-hidden="true" size={17} />
              <input id="storefront-search" type="search" name="q" placeholder="Books, games, records, ISBNs..." />
            </form>
            <Link href="/sell-or-trade" className={styles.tradeLine}>Bring your old ones in - we buy, sell &amp; trade</Link>
            <button type="button" onClick={() => scrollTo("trade-counter")} className={styles.openLine}>
              <span aria-hidden="true" />
              Open until 7pm
            </button>
          </div>
        </section>

        <section id="inside" aria-label="Inside the shop" className={styles.roomsSection}>
          <div className={styles.roomsGrid}>
            {rooms.map((room) => (
              <Link
                href={room.href}
                key={room.href}
                aria-label={`${room.label} department - Browse`}
                className={styles.roomCard}
              >
                <Image
                  src={room.image}
                  alt={`${room.label} room at Bookmart and Game Exchange`}
                  fill
                  sizes="(min-width: 900px) 25vw, 100vw"
                  className={styles.roomImage}
                />
                <span className={styles.roomGrade} style={{ background: room.grade }} aria-hidden="true" />
                <span className={styles.roomGlow} style={{ "--room-glow": room.glow } as React.CSSProperties} aria-hidden="true" />
                <span className={styles.roomText}>
                  {room.showLabel ? <strong>{room.label}</strong> : null}
                  <span>{room.tags.join(" · ")}</span>
                  <small>{room.count}</small>
                  <em>Browse <ArrowRight aria-hidden="true" size={14} /></em>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section id="trade-counter" className={styles.tradeCounter} aria-label="The Trade Counter">
          <div className={styles.tradeCopy}>
            <p>We buy &amp; trade</p>
            <h2>The Trade Counter</h2>
            <span>
              Bring in books, games, consoles, vinyl or films. We will look at everything,
              tell you honestly what it is worth, and pay in cash or credit against anything in the shop.
            </span>
            <Link href="/sell-or-trade"><Bell aria-hidden="true" size={16} /> Ring the bell</Link>
          </div>
          <dl className={styles.tradeFacts}>
            <div>
              <MapPin aria-hidden="true" size={18} />
              <dt>Find us</dt>
              <dd><a href={mapsHref} target="_blank" rel="noreferrer">73 Talbot Street<br />Dublin 1</a></dd>
            </div>
            <div>
              <Clock aria-hidden="true" size={18} />
              <dt>Open</dt>
              <dd>Mon-Sun <span>10am - 7pm</span></dd>
            </div>
            <div>
              <Phone aria-hidden="true" size={18} />
              <dt>Ring us</dt>
              <dd><a href="tel:+35318551300">01 855 1300</a></dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}

function ShopBar() {
  return (
    <header className={styles.shopBar}>
      <Link href="/" aria-label="Bookmart and Game Exchange home" className={styles.logo}>
        <span>Bookmart</span>
        <small>&amp; GameXchange</small>
      </Link>
      <nav aria-label="The counter" className={styles.counterNav}>
        <Link href="/account/login" className={styles.adminLink} aria-label="Admin login">
          <User aria-hidden="true" size={17} />
          <span>Admin</span>
        </Link>
        <Link href="/wishlist" aria-label="Wishlist" title="Wishlist"><Heart aria-hidden="true" size={18} /></Link>
        <Link href="/basket" aria-label="Basket" title="Basket"><ShoppingBag aria-hidden="true" size={18} /></Link>
      </nav>
    </header>
  );
}
