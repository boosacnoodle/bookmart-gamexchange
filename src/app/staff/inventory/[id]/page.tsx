import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductStateForm } from "@/components/state-form";
import { formatMoney } from "@/lib/format";
import { db } from "@/lib/db";

export default async function StaffProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id }, include: { stockLocation: true } });
  if (!product) notFound();
  return (
    <>
      <div className="management-head"><h1>{product.title}</h1><Link className="button button-primary" href={`/staff/inventory/${product.id}/edit`}>Edit product</Link></div>
      <div className="management-card">
        <p><strong>{formatMoney(product.priceMinor)}</strong> / {product.inventoryState} / {product.sku}</p>
        <p>{product.conditionReport}</p>
        <p>Location: {product.stockLocation?.publicLabel ?? product.shelfLocation}</p>
        <div className="button-row">
          <ProductStateForm id={product.id} state={product.inventoryState} />
          <Link href={`/staff/inventory/${product.id}/label`} className="button button-secondary">Print QR label</Link>
          <Link href={`/products/${product.slug}`} className="button button-secondary">View public page</Link>
        </div>
      </div>
    </>
  );
}
