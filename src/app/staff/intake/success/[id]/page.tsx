import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { db } from "@/lib/db";
import { categoryRoute, publicDepartmentFor } from "@/lib/intake/classification";

export default async function IntakeSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id }, include: { stockLocation: true } });
  if (!product) notFound();
  const publicPath = `/products/${product.slug}`;
  return (
    <section className="management-main">
      <div className="success-panel">
        <h1>Listing published</h1>
        <p>{product.inventoryState === "PUBLISHED" ? "The item is live on the public website and searchable now." : "Draft created for staff review."}</p>
        <img className="success-image" src={product.imageUrl} alt="" />
        <dl className="detail-list">
          <dt>Title</dt><dd>{product.title}</dd>
          <dt>Price</dt><dd>{formatMoney(product.priceMinor)}</dd>
          <dt>Category</dt><dd>{publicDepartmentFor(product.category, product.platform)}</dd>
          <dt>Condition</dt><dd>{product.conditionGrade.replace(/_/g, " ").toLowerCase()}</dd>
          <dt>SKU</dt><dd>{product.sku}</dd>
          <dt>Location</dt><dd>{product.stockLocation?.publicLabel ?? product.shelfLocation}</dd>
          <dt>Public URL</dt><dd><Link href={publicPath}>{publicPath}</Link></dd>
        </dl>
        <div className="button-row">
          <Link className="button button-primary" href="/staff/intake">Scan another item</Link>
          <Link className="button button-secondary" href={publicPath}>View live listing</Link>
          <Link className="button button-secondary" href={`/staff/inventory/${product.id}/label`}>Print QR label</Link>
          <Link className="button button-secondary" href={`/staff/inventory/${product.id}/edit`}>Edit listing</Link>
          <Link className="button button-secondary" href={categoryRoute(product.category, product.platform)}>View category</Link>
        </div>
      </div>
    </section>
  );
}
