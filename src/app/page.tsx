"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, Trophy, User, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./storefront-home.module.css";

const departments = [
  { label: "Books", href: "/books", tone: "books", icon: "book" },
  { label: "Rare Books", href: "/rare-and-collectible", tone: "rare", icon: "stack" },
  { label: "Retro Games", href: "/video-games", tone: "retro", icon: "alien" },
  { label: "Nintendo", href: "/search?platform=nintendo", tone: "nintendo", icon: "controller" },
  { label: "PlayStation", href: "/search?platform=playstation", tone: "playstation", icon: "playstation" },
  { label: "Xbox", href: "/search?platform=xbox", tone: "xbox", icon: "xbox" },
  { label: "Films & Music", href: "/music-and-film", tone: "media", icon: "film" },
  { label: "More", href: "/collections", tone: "more", icon: "more" }
] as const;

const menuLinks = [
  { label: "Search", href: "/search" },
  { label: "Books", href: "/books" },
  { label: "Rare Books", href: "/rare-and-collectible" },
  { label: "Retro Games", href: "/video-games" },
  { label: "Consoles", href: "/consoles-and-accessories" },
  { label: "Films & Music", href: "/music-and-film" },
  { label: "Sell / Trade", href: "/sell-or-trade" },
  { label: "Staff Intake", href: "/staff/intake" },
  { label: "Visit Our Shop", href: "/visit-us" }
] as const;

const services = [
  { label: "Fast Dispatch", detail: "Carefully packed", href: "/shipping", icon: "truck" },
  { label: "Click & Collect", detail: "Free in-store pickup", href: "/visit-us", icon: "bag" },
  { label: "Safe & Secure", detail: "Secure payments", href: "/privacy", icon: "shield" },
  { label: "Visit Our Shop", detail: "Talbot Street, Dublin 1", href: "/visit-us", icon: "pin" }
] as const;

function DepartmentIcon({ type }: { type: (typeof departments)[number]["icon"] }) {
  if (type === "book") return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="4"><path d="M8 14h18c6 0 8 4 8 4v34s-2-4-8-4H8V14z" /><path d="M56 14H38c-6 0-8 4-8 4v34s2-4 8-4h18V14z" /><path d="M16 24h10M16 32h10M42 24h10M42 32h10" /></svg>;
  if (type === "stack") return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="4"><path d="M14 12h12v40H14zM30 8h12v44H30zM46 16h8v36h-8z" /><path d="M14 22h12M30 18h12M46 28h8" /></svg>;
  if (type === "alien") return <svg viewBox="0 0 64 64" fill="currentColor"><path d="M18 18h4v4h4v-4h12v4h4v-4h4v4h-4v4h8v4h4v12h-4v6h-6v-6H20v6h-6v-6h-4V30h4v-4h8v-4h-4V18zm8 16h4v4h-4v-4zm8 0h4v4h-4v-4z" /></svg>;
  if (type === "controller") return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="4"><rect x="8" y="20" width="48" height="24" rx="3" /><path d="M20 28v8M16 32h8" /><circle cx="42" cy="32" r="2" /><circle cx="50" cy="32" r="2" /></svg>;
  if (type === "playstation") return <svg viewBox="0 0 64 64" fill="currentColor"><path d="M28 8h10c8 0 12 4 12 11 0 8-5 13-15 15V15h-7v39l-8-3V11c0-2 2-3 8-3z" /><path d="M21 42c-8 2-13 5-13 9 0 5 9 7 22 5v-5c-7 1-12 1-12-1 0-1 3-3 8-4l-5-4zM41 39l-5 4c8 1 13 3 13 5s-6 4-15 5v5c14-2 22-6 22-11 0-4-6-7-15-8z" /></svg>;
  if (type === "xbox") return <svg viewBox="0 0 64 64" fill="currentColor"><circle cx="32" cy="32" r="24" opacity=".35" /><path d="M17 17c7 1 12 5 15 10 3-5 8-9 15-10-4-4-9-6-15-6s-11 2-15 6zM13 23c0 19 7 26 14 31-1-10 0-18 5-25-6-5-12-7-19-6zM51 23c-7-1-13 1-19 6 5 7 6 15 5 25 7-5 14-12 14-31z" /></svg>;
  if (type === "film") return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="4"><path d="M10 20h36v28H10z" /><path d="M14 20l6-10h10l-6 10M32 20l6-10h10l-6 10" /><path d="M44 35v13M44 35l10-3v12" /></svg>;
  return <svg viewBox="0 0 64 64" fill="currentColor"><circle cx="18" cy="32" r="5" /><circle cx="32" cy="32" r="5" /><circle cx="46" cy="32" r="5" /></svg>;
}

function ServiceIcon({ type }: { type: (typeof services)[number]["icon"] }) {
  if (type === "truck") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></svg>;
  if (type === "bag") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>;
  if (type === "shield") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3z" /><path d="M8.5 12l2.2 2.2 4.8-5" /></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 21s7-5.1 7-11a7 7 0 0 0-14 0c0 5.9 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>;
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <main className={`${styles.root} hybridStorefrontRoot`} aria-labelledby="home-title">
      <div className={styles.atmosphere} aria-hidden="true" />
      <header className={styles.topbar}>
        <button className={styles.menuButton} type="button" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
          <Menu aria-hidden="true" size={25} />
          <span>Menu</span>
        </button>

        <nav className={styles.utilityNav} aria-label="Account, wishlist and basket">
          <Link href="/account/login" aria-label="Account"><User aria-hidden="true" size={22} /><span>Account</span></Link>
          <Link href="/wishlist" aria-label="Wishlist"><Heart aria-hidden="true" size={23} /><span>Wishlist</span></Link>
          <Link href="/basket" aria-label="Basket"><ShoppingBag aria-hidden="true" size={22} /><span>Basket</span></Link>
        </nav>
      </header>

      {menuOpen ? (
        <div className={styles.menuBackdrop} role="presentation" onMouseDown={() => setMenuOpen(false)}>
          <div className={styles.menuPanel} role="dialog" aria-modal="true" aria-label="Shop menu" ref={menuRef} onMouseDown={(event) => event.stopPropagation()}>
            <button className={styles.menuClose} type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
              <X aria-hidden="true" size={21} />
              <span>Close</span>
            </button>
            <p>Departments</p>
            {menuLinks.map((item) => (
              <Link href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
                <span>{item.label}</span>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <section className={styles.hero} aria-label="Bookmart and Game Exchange storefront">
        <h1 id="home-title" className={styles.screenHeading}>Bookmart &amp; Game Exchange</h1>
        <Image className={`${styles.heroImage} ${styles.mobileHeroImage}`} src="/storefront/bookmart-retro-homepage.jpg" width={591} height={535} priority alt="Bookmart and Game Exchange illustrated storefront with open doors, bookshelves, games, neon signs and address panel." />
        <Image className={`${styles.heroImage} ${styles.desktopHeroImage}`} src="/storefront/bookmart-retro-homepage-desktop.png" width={1774} height={887} priority alt="Wide Bookmart and Game Exchange illustrated storefront with open doors, bookshelves, games, neon signs and address panel." />
        <Link className={styles.mapHotspot} href="https://www.google.com/maps/search/?api=1&query=Bookmart%20%26%20Game%20Exchange%2073%20Talbot%20Street%20Dublin%201%20D01%20C861" aria-label="Open Bookmart and Game Exchange on Google Maps" />
      </section>

      <form className={styles.searchForm} action="/search" role="search">
        <label className="sr-only" htmlFor="storefront-search">Search products</label>
        <input id="storefront-search" type="search" name="q" placeholder="What are you looking for today?" />
        <button type="submit" aria-label="Search"><Search aria-hidden="true" size={34} /></button>
      </form>

      <section className={styles.trustStrip} aria-label="Shop promises">
        <span><Trophy aria-hidden="true" size={24} />35+ years<br />in business</span>
        <span><span aria-hidden="true" className={styles.star}>☆</span>Carefully<br />curated</span>
        <span><span aria-hidden="true" className={styles.tag}>◇</span>Fair prices<br />great value</span>
        <span><span aria-hidden="true" className={styles.swap}>⇄</span>Trade / sell<br />welcome</span>
      </section>

      <section className={styles.departments} aria-labelledby="departments-heading">
        <div className={styles.sectionHead}>
          <h2 id="departments-heading">Explore the shop</h2>
          <p>Click a department to walk through</p>
        </div>
        <nav className={styles.departmentGrid} aria-label="Shop departments">
          {departments.map((department) => (
            <Link className={`${styles.departmentCard} ${styles[department.tone]}`} href={department.href} key={department.href} aria-label={department.label}>
              <strong>{department.label}</strong>
              <span className={styles.departmentIcon} aria-hidden="true"><DepartmentIcon type={department.icon} /></span>
              <em aria-hidden="true">→</em>
            </Link>
          ))}
        </nav>
      </section>

      <nav className={styles.serviceGrid} aria-label="Useful links">
        {services.map((item) => (
          <Link href={item.href} key={`${item.label}-${item.href}`}>
            <ServiceIcon type={item.icon} />
            <span>{item.label}</span>
            <small>{item.detail}</small>
          </Link>
        ))}
      </nav>

      <footer className={styles.footer}>
        <p><span aria-hidden="true">♥</span> “A great place to lose track of time...” <span aria-hidden="true">♥</span></p>
        <small>— Our Customers —</small>
      </footer>
    </main>
  );
}
