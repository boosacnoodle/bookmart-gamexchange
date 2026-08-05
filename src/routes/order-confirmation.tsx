import { createFileRoute, Link } from "@tanstack/react-router";
import { ShopPage } from "@/components/shop/ShopPage";
import { getOrderConfirmation } from "@/lib/checkout.server";

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: (search: Record<string, unknown>) => ({
    order: typeof search.order === "string" ? search.order : "",
    adapter: search.adapter === "pending" || search.adapter === "true" || search.adapter === true,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    deps.order
      ? getOrderConfirmation({ data: { orderNumber: deps.order, adapter: deps.adapter } })
      : null,
  component: Confirmation,
});
function Confirmation() {
  const order = Route.useLoaderData();
  return (
    <ShopPage
      eyebrow="From the till"
      title={order ? `Order ${order.orderNumber}` : "Order status"}
      intro={
        order?.paymentStatus === "PAID"
          ? "Payment confirmed. We have the order behind the counter."
          : "Payment is still pending. We never mark an item sold until Stripe confirms it."
      }
    >
      {order ? (
        <div className="rounded-sm bg-timber-deep/60 p-6">
          <p className="shop-meta text-brass/60">
            {order.paymentStatus} ·{" "}
            {order.deliveryMethod === "CLICK_AND_COLLECT" ? "Click & collect" : "Ireland delivery"}
          </p>
          <p className="sign-plate mt-3 text-xl text-lamplight">
            €{(order.totalMinor / 100).toFixed(2)}
          </p>
          {order.items.map((item) => (
            <p key={item.id} className="mt-3 text-foreground/70">
              {item.title} · {item.sku}
            </p>
          ))}
        </div>
      ) : (
        <p>This confirmation link is not valid.</p>
      )}
      <Link to="/" className="shop-meta mt-8 inline-flex text-brass">
        Back to the shop →
      </Link>
    </ShopPage>
  );
}
