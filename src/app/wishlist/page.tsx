import Link from "next/link";

export default function WishlistPage() {
  return (
    <main className="page-hero">
      <div>
        <h1>Wishlist</h1>
        <p>Your saved items will appear here. Browse the shop and come back when you have a few finds to compare.</p>
        <div className="button-row">
          <Link className="button button-primary" href="/search">Search the shop</Link>
          <Link className="button button-secondary" href="/">Back home</Link>
        </div>
      </div>
    </main>
  );
}
