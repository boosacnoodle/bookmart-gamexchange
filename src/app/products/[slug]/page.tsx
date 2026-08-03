import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToBasket } from "@/components/add-to-basket";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGrid } from "@/components/product-card";
import { RecentlyViewed, TrackRecentlyViewed } from "@/components/recently-viewed";
import { categoryLabel, conditionLabel, formatMoney } from "@/lib/format";
import { getProduct, getProducts, getRelatedProducts } from "@/lib/catalog";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return {
    title: product?.title ?? "Product",
    description: product?.shortDescription
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product);

  return (
    <>
      <TrackRecentlyViewed slug={product.slug} title={product.title} />
      <Breadcrumbs items={[{ href: "/search", label: "Catalogue" }, { label: product.title }]} />
      <section className="product-detail premium-product-detail">
        <div className="product-gallery">
          <Image src={product.imageUrl} alt={`Actual demo item photo for ${product.title}`} width={900} height={1125} className="gallery-main" priority />
          <div className="gallery-thumbs">
            {product.gallery.map((image) => <Image src={image} alt="" width={180} height={180} key={image} />)}
          </div>
        </div>
        <div className="product-info">
          <p className="product-meta">{categoryLabel(product.category)} / {product.subcategory}</p>
          <h1>{product.title}</h1>
          <div className="purchase-panel">
            <div><p className="price">{formatMoney(product.priceMinor)}</p><p className="stock-label">One copy available</p></div>
            <AddToBasket product={product} />
          </div>
          <p>{product.shortDescription}</p>
          <div className="trust-strip"><span>Actual-item listing</span><span>Click & collect</span><span>Irish shipping rules</span></div>
          <dl className="detail-list">
            <dt>Condition</dt><dd>{conditionLabel(product.conditionGrade)}</dd>
            <dt>SKU</dt><dd>{product.sku}</dd>
            {product.creator ? <><dt>Creator</dt><dd>{product.creator}</dd></> : null}
            {product.publisher ? <><dt>Publisher</dt><dd>{product.publisher}</dd></> : null}
            {product.platform ? <><dt>Platform</dt><dd>{product.platform}</dd></> : null}
            {product.format ? <><dt>Format</dt><dd>{product.format}</dd></> : null}
            {product.testedStatus ? <><dt>Tested status</dt><dd>{product.testedStatus}</dd></> : null}
            <dt>Location</dt><dd>{product.shelfLocation}</dd>
          </dl>
          <div className="copy-block"><h2>Condition report</h2><p>{product.conditionReport}</p></div>
          <div className="copy-block"><h2>Included</h2><p>{product.included.join(", ")}{product.missing.length ? `. Missing: ${product.missing.join(", ")}.` : "."}</p></div>
          <div className="copy-block"><h2>Delivery and collection</h2><p>Click and collect from 73 Talbot Street is available. Irish shipping rules are configurable before launch.</p></div>
        </div>
      </section>
      <section className="section compact"><div className="section-head"><h2>Related products</h2></div><ProductGrid products={related} /></section>
      <RecentlyViewed />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.title,
            image: product.gallery,
            description: product.shortDescription,
            sku: product.sku,
            offers: { "@type": "Offer", priceCurrency: "EUR", price: product.priceMinor / 100, availability: "https://schema.org/InStock" }
          })
        }}
      />
    </>
  );
}
