import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Staff Dashboard" };

export default async function StaffDashboard() {
  const [drafts, review, live, orders, recent] = await Promise.all([
    db.product.count({ where: { inventoryState: "DRAFT" } }),
    db.product.count({ where: { inventoryState: "NEEDS_REVIEW" } }),
    db.product.count({ where: { inventoryState: "PUBLISHED" } }),
    db.order.count({ where: { status: { in: ["PENDING_PAYMENT", "PAID", "PROCESSING", "READY_FOR_COLLECTION"] } } }),
    db.product.count({ where: { createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } } })
  ]);
  return (
    <>
      <div className="management-head">
        <h1>Staff dashboard</h1>
        <Link className="button button-primary" href="/staff/intake">Scan and list item</Link>
      </div>
      <div className="management-card">
        <h2>Daily intake</h2>
        <p>Start here to scan a barcode, confirm condition and publish one physical shop copy.</p>
        <div className="button-row">
          <Link className="button button-primary" href="/staff/intake">Scan and list item</Link>
          <Link className="button button-secondary" href="/staff/inventory/new">Add item manually</Link>
        </div>
      </div>
      <div className="metric-grid">
        <Link href="/staff/inventory" className="metric"><span>{recent}</span><strong>Recent listings</strong></Link>
        <Link href="/staff/inventory" className="metric"><span>{drafts}</span><strong>Draft listings</strong></Link>
        <Link href="/staff/inventory" className="metric"><span>{review}</span><strong>Items needing review</strong></Link>
        <Link href="/staff/inventory" className="metric"><span>{live}</span><strong>Published products</strong></Link>
        <Link href="/staff/orders" className="metric"><span>{orders}</span><strong>Orders requiring action</strong></Link>
      </div>
    </>
  );
}
