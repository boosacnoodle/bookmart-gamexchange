import Link from "next/link";
import { OrderStatusForm, RefundForm } from "@/components/state-form";
import { formatMoney } from "@/lib/format";
import { db } from "@/lib/db";

export const metadata = { title: "Staff Orders" };

export default async function StaffOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams;
  const orders = await db.order.findMany({
    where: {
      ...(params.status ? { status: params.status as never } : {}),
      ...(params.q ? {
        OR: [
          { orderNumber: { contains: params.q, mode: "insensitive" } },
          { customerName: { contains: params.q, mode: "insensitive" } },
          { customerEmail: { contains: params.q, mode: "insensitive" } }
        ]
      } : {})
    },
    orderBy: { createdAt: "desc" },
    include: { items: true, reservations: true, emailEvents: { orderBy: { createdAt: "desc" }, take: 3 }, refunds: true }
  });
  return (
    <>
      <div className="management-head"><h1>Orders</h1></div>
      <form className="inline-form">
        <input name="q" placeholder="Search order, customer or email" defaultValue={params.q} />
        <select name="status" defaultValue={params.status ?? ""}>
          <option value="">All statuses</option>
          {["PENDING_PAYMENT", "PAID", "PROCESSING", "READY_FOR_COLLECTION", "SHIPPED", "COMPLETED", "CANCELLED", "PAYMENT_FAILED", "REFUNDED", "PARTIALLY_REFUNDED"].map((item) => <option value={item} key={item}>{item}</option>)}
        </select>
        <button className="button button-secondary">Filter</button>
      </form>
      <div className="data-table">
        {orders.map((order) => (
          <article className="data-row" key={order.id}>
            <div>
              <strong><Link href={`/order-confirmation?order=${order.orderNumber}`}>{order.orderNumber}</Link></strong>
              <p>{order.customerName} / {order.customerEmail} / {order.deliveryMethod} / {order.paymentStatus}</p>
              <p>{order.items.map((item) => `${item.title} (${item.skuSnapshot})`).join(", ")}</p>
              <p>Reservations: {order.reservations.map((reservation) => reservation.state).join(", ") || "none"} / Email: {order.emailStatus}</p>
              {order.trackingNumber ? <p>Tracking: {order.trackingNumber}</p> : null}
              {order.emailEvents.map((event) => <p key={event.id}>{event.template}: {event.status}</p>)}
            </div>
            <div>
              <span>{formatMoney(order.totalMinor)}</span>
              <OrderStatusForm id={order.id} status={order.status} />
              {order.paymentStatus === "PAID" || order.paymentStatus === "PARTIALLY_REFUNDED" ? <RefundForm orderId={order.id} paidMinor={order.totalMinor} /> : null}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
