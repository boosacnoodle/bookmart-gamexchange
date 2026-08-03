import { saveStockLocation } from "@/app/management-actions";
import { db } from "@/lib/db";

export const metadata = { title: "Stock Locations" };

export default async function LocationsPage() {
  const locations = await db.stockLocation.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <>
      <div className="management-head"><h1>Stock locations</h1></div>
      <form action={saveStockLocation} className="management-form compact-form">
        <label>Name<input name="name" required /></label>
        <label>Public label<input name="publicLabel" required /></label>
        <label>Notes<input name="notes" /></label>
        <button className="button button-primary" type="submit">Create location</button>
      </form>
      <div className="data-table">
        {locations.map((location) => (
          <article className="data-row" key={location.id}>
            <div><strong>{location.name}</strong><p>{location.publicLabel}</p></div>
            <span>{location._count.products} products</span>
          </article>
        ))}
      </div>
    </>
  );
}
