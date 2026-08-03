import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGrid } from "@/components/product-card";
import { getCategoryBySlug, getProducts } from "@/lib/catalog";

export async function CategoryPage({ slug }: { slug: string }) {
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const products = await getProducts({ category: category.category });
  return (
    <div className={`category-world category-world-${category.slug}`}>
      <Breadcrumbs items={[{ label: category.title }]} />
      <section className="page-hero">
        <div><h1>{category.title}</h1><p>{category.intro}</p></div>
      </section>
      <section className="section compact"><ProductGrid products={products} /></section>
    </div>
  );
}
