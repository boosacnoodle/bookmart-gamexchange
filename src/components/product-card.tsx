import Image from "next/image";
import Link from "next/link";
import { conditionLabel, formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";

function productBadges(product: Product, available: boolean) {
  const badges = [];
  if (available && product.quantity === 1) badges.push("Only one available");
  if (product.isRare) badges.push("Rare");
  if (product.conditionGrade === "LIKE_NEW" || product.conditionGrade === "VERY_GOOD") badges.push("Excellent condition");
  if (product.conditionGrade === "STAFF_REVIEWED_COLLECTIBLE") badges.push("Collectible");
  if (/signed|inscribed/i.test(`${product.title} ${product.conditionReport}`)) badges.push("Signed");
  if (/vinyl|retro|vintage|playstation 2|ps2|cartridge/i.test(`${product.subcategory} ${product.platform ?? ""} ${product.format ?? ""}`)) badges.push("Vintage");
  return badges.slice(0, 3);
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const available = product.inventoryState === "PUBLISHED" && product.quantity > 0;
  const badges = productBadges(product, available);

  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-image-link">
        <Image src={product.imageUrl} alt={`Photo of ${product.title}`} width={520} height={650} className="product-image" loading={priority ? "eager" : "lazy"} />
        {badges.length ? <span className="product-card-badge">{badges[0]}</span> : null}
      </Link>
      <div className="product-card-body">
        <p className="product-meta">{product.subcategory}{product.platform ? ` / ${product.platform}` : ""}</p>
        <h3><Link href={`/products/${product.slug}`}>{product.title}</Link></h3>
        {badges.length > 1 ? <div className="badge-row">{badges.slice(1).map((badge) => <span key={badge}>{badge}</span>)}</div> : null}
        <div className="product-card-foot">
          <strong>{formatMoney(product.priceMinor)}</strong>
          <span className="condition-badge">{conditionLabel(product.conditionGrade)}</span>
        </div>
        <p className={available ? "stock-label" : "stock-label sold"}>{available ? "One copy available" : "Sold"}</p>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <h2>No matching items</h2>
        <p>Try a broader search or send a wanted-item request and staff can watch for it.</p>
        <Link href="/request-item" className="button button-secondary">Request an item</Link>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => <ProductCard product={product} priority={index < 4} key={product.id} />)}
    </div>
  );
}
