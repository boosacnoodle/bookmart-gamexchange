import Link from "next/link";
import { ProductStateForm } from "@/components/state-form";
import { formatMoney } from "@/lib/format";
import { db } from "@/lib/db";

export const metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const products = await db.product.findMany({ orderBy: { updatedAt: "desc" }, include: { stockLocation: true } });
  return (
    <>
      <div className="management-head"><h1>Inventory</h1><Link className="button button-primary" href="/staff/inventory/new">Create product</Link></div>
      <div className="data-table">
        {products.map((product) => (
          <article className="data-row" key={product.id}>
            <div><strong><Link href={`/staff/inventory/${product.id}`}>{product.title}</Link></strong><p>{product.sku} / {product.category} / {product.stockLocation?.publicLabel ?? product.shelfLocation}</p></div>
            <span>{formatMoney(product.priceMinor)}</span>
            <ProductStateForm id={product.id} state={product.inventoryState} />
          </article>
        ))}
      </div>
    </>
  );
}
