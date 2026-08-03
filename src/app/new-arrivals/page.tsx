import { ProductGrid } from "@/components/product-card";
import { getNewArrivals } from "@/lib/catalog";

export const metadata = { title: "New Arrivals" };

export default async function NewArrivalsPage() {
  const products = await getNewArrivals();
  return (
    <>
      <section className="page-hero"><div><h1>Just arrived on Talbot Street</h1><p>Fresh fictional demo listings across the whole shop, each treated as an individual physical item.</p></div></section>
      <section className="section compact"><ProductGrid products={products} /></section>
    </>
  );
}
