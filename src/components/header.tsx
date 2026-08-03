"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navItems } from "@/lib/routes";

export function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = menuRef.current?.querySelectorAll<HTMLElement>("a, button");
    focusable?.[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <header className="site-header">
      <Link href="/" className="brand" onClick={() => setOpen(false)}>
        <span className="brand-mark">B/G</span>
        <span>
          <strong>Bookmart & Gamexchange</strong>
          <small>Independent stock from Talbot Street</small>
        </span>
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.slice(1).map((item) => (
          <Link href={item.href} key={item.href}>{item.label}</Link>
        ))}
      </nav>
      <div className="header-actions">
        <button className="menu-button" type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
          <Menu size={22} />
        </button>
        <Link href="/account/login" className="icon-link" aria-label="Account"><User size={20} /></Link>
        <Link href="/search" className="icon-link" aria-label="Search"><Search size={20} /></Link>
        <Link href="/basket" className="icon-link" aria-label="Basket"><ShoppingBag size={20} /></Link>
      </div>
      {open ? (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Shop menu" ref={menuRef}>
          <button className="menu-close" type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
            <X size={22} />
          </button>
          {navItems.map((item) => (
            <Link href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
          <Link href="/account/login" onClick={() => setOpen(false)}>Login</Link>
          <Link href="/basket" onClick={() => setOpen(false)}>Basket</Link>
        </div>
      ) : null}
    </header>
  );
}
