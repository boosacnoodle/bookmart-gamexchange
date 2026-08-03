import { Suspense } from "react";
import { ProductGrid } from "@/components/product-card";
import { SearchFilters } from "@/components/search-filters";
import { getProducts, getSearchFacets } from "@/lib/catalog";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const allProducts = await getProducts();
  const facets = getSearchFacets(allProducts);
  const products = await getProducts({
    q: params.q,
    condition: params.condition,
    platform: params.platform,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined
  });

  return (
    <>
      <section className="page-hero search-hero"><div><h1>Search the shop</h1><p>Find books, games, consoles and collectibles by title, author, ISBN, publisher, platform or category.</p></div></section>
      <section className="section compact">
        <Suspense><SearchFilters conditions={facets.conditions} platforms={facets.platforms} /></Suspense>
        <ProductGrid products={products} />
      </section>
    </>
  );
}
