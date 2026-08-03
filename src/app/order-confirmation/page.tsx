import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Order Confirmation" };

export default async function OrderConfirmationPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const params = await searchParams;
  const order = params.order ? await db.order.findUnique({ where: { orderNumber: params.order }, include: { items: true, emailEvents: { orderBy: { createdAt: "desc" } } } }) : null;
  if (!order) {
    return (
      <section className="page-hero">
        <div>
          <h1>Order status</h1>
          <p>Enter from a valid checkout confirmation link to view the latest payment status.</p>
          <Link href="/basket" className="button button-primary">Return to basket</Link>
        </div>
      </section>
    );
  }

  const statusCopy = order.paymentStatus === "PAID"
    ? "Payment confirmed by Stripe webhook."
    : order.paymentStatus === "FAILED"
      ? "Payment failed or the checkout session expired."
      : "Payment is pending. This page does not assume payment succeeded until the Stripe webhook confirms it.";

  return (
    <section className="order-status-page">
      <div className="success-panel">
        <h1>Order {order.orderNumber}</h1>
        <p>{statusCopy}</p>
        <dl className="details-list">
          <div><dt>Status</dt><dd>{order.status}</dd></div>
          <div><dt>Payment</dt><dd>{order.paymentStatus}</dd></div>
          <div><dt>Total</dt><dd>{formatMoney(order.totalMinor)}</dd></div>
          <div><dt>Delivery</dt><dd>{order.deliveryMethod === "CLICK_AND_COLLECT" ? "Click and collect" : "Ireland shipping"}</dd></div>
          <div><dt>Email</dt><dd>{order.emailStatus}</dd></div>
        </dl>
        <h2>Items</h2>
        {order.items.map((item) => <p key={item.id}>{item.title} / {item.skuSnapshot} / {formatMoney(item.priceMinor)}</p>)}
        <div className="button-row">
          <Link href="/account/orders" className="button button-primary">View account orders</Link>
          <Link href="/contact" className="button button-secondary">Contact the shop</Link>
        </div>
      </div>
    </section>
  );
}
