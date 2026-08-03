import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Curated Shelves Admin" };

export default async function CuratedShelvesAdminPage() {
  const shelves = await db.curatedShelf.findMany({ orderBy: { displayOrder: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <>
      <div className="management-head"><h1>Curated shelves</h1><Link className="button button-secondary" href="/collections">View public shelves</Link></div>
      <div className="data-table">
        {shelves.map((shelf) => (
          <article className="data-row" key={shelf.id}>
            <div><strong>{shelf.title}</strong><p>{shelf.status} / homepage {shelf.homepageVisible ? "visible" : "hidden"} / {shelf._count.products} products</p></div>
          </article>
        ))}
      </div>
    </>
  );
}
