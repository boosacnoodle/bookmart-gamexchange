import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGrid } from "@/components/product-card";
import { getShelf, getShelves } from "@/lib/catalog";

export async function generateStaticParams() {
  const shelves = await getShelves();
  return shelves.map((shelf) => ({ slug: shelf.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shelf = await getShelf(slug);
  return { title: shelf?.title ?? "Collection" };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shelf = await getShelf(slug);
  if (!shelf) notFound();
  return (
    <>
      <Breadcrumbs items={[{ href: "/collections", label: "Curated Shelves" }, { label: shelf.title }]} />
      <section className="product-detail">
        <Image src={shelf.coverImageUrl} alt="" width={900} height={640} className="gallery-main" />
        <div className="product-info">
          <p className="product-meta">{shelf.curatorName ?? "Staff shelf"}</p>
          <h1>{shelf.title}</h1>
          <p>{shelf.introduction}</p>
          <p className="stock-label">Editorial shelf</p>
        </div>
      </section>
      <section className="section compact"><ProductGrid products={shelf.products} /></section>
    </>
  );
}
