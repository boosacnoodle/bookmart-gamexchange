import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Order Tracking" };

export default async function OrdersPage() {
  const user = await requireUser(["CUSTOMER", "STAFF", "ADMIN"], "/account/orders");
  const orders = await db.order.findMany({ where: { customerEmail: user.email }, orderBy: { createdAt: "desc" }, include: { items: true } });
  return (
    <section className="section">
      <div className="section-head"><h1>Order tracking</h1><p>Orders for {user.email}.</p></div>
      {orders.length ? (
        <div className="data-table">
          {orders.map((order) => (
            <article className="data-row" key={order.id}>
              <div><strong><Link href={`/order-confirmation?order=${order.orderNumber}`}>{order.orderNumber}</Link></strong><p>{order.status} / {order.deliveryMethod} / {order.paymentStatus}</p><p>{order.items.map((item) => item.title).join(", ")}</p></div>
              <span>{formatMoney(order.totalMinor)}</span>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><h2>No orders yet</h2><p>Your online orders and click-and-collect reservations will appear here.</p><Link className="button button-primary" href="/search">Search inventory</Link></div>
      )}
    </section>
  );
}
