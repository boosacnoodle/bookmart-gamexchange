import { ShelfCard } from "@/components/shelf-card";
import { getShelves } from "@/lib/catalog";

export const metadata = { title: "Curated Shelves" };

export default async function CollectionsPage() {
  const shelves = await getShelves();
  return (
    <>
      <section className="page-hero"><div><h1>Curated digital shelves</h1><p>Staff-made editorial shelves with their own identity, notes and product order.</p></div></section>
      <section className="section compact"><div className="shelf-grid">{shelves.map((shelf) => <ShelfCard shelf={shelf} key={shelf.id} />)}</div></section>
    </>
  );
}
