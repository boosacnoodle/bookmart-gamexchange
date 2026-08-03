import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <h2>Bookmart & Gamexchange</h2>
        <p>Dublin's independent marketplace for books, games, consoles and collectibles from 73 Talbot Street.</p>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/about">About</Link>
        <Link href="/visit-us">Visit Us</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/returns">Returns</Link>
        <Link href="/shipping">Shipping</Link>
        <Link href="/cookies">Cookies</Link>
      </nav>
    </footer>
  );
}
