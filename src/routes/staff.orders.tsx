import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { BigButton, Empty } from "@/components/staff/StaffKit";
import { StaffShell } from "@/components/staff/StaffShell";
import { getStaffOrders, updateStaffOrder } from "@/lib/backoffice.server";

export const Route = createFileRoute("/staff/orders")({
  loader: () => getStaffOrders(),
  head: () => ({
    meta: [{ title: "Orders — Bookmart back office" }, { name: "robots", content: "noindex" }],
  }),
  component: StaffOrders,
});

function StaffOrders() {
  const orders = Route.useLoaderData();
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [problem, setProblem] = useState("");

  async function act(orderId: string, action: "processing" | "ready" | "shipped" | "completed") {
    setPending(orderId);
    setProblem("");
    try {
      await updateStaffOrder({ data: { orderId, action } });
      await router.invalidate();
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "The order could not be updated.");
    } finally {
      setPending(null);
    }
  }

  return (
    <StaffShell
      step="Orders"
      title="Orders to deal with"
      intro="Paid orders stay here until they are collected, shipped or finished."
      back={{ to: "/staff/today", label: "Today" }}
    >
      <p aria-live="polite" className="mb-4 text-sm text-lamplight/75">
        {problem}
      </p>
      <div className="space-y-4">
        {orders.length === 0 ? (
          <Empty>No paid orders are waiting.</Empty>
        ) : (
          orders.map((order) => (
            <article
              key={order.id}
              className="rounded-sm bg-timber-deep/45 p-5"
              style={{
                boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--brass) 16%, transparent)",
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="sign-plate text-lamplight">{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-foreground/60">
                    {order.customerName} · {order.customerEmail}
                  </p>
                </div>
                <p className="shop-meta text-brass/65">€{(order.totalMinor / 100).toFixed(2)}</p>
              </div>
              <p className="shop-meta mt-4 text-brass/50">
                {order.deliveryMethod === "CLICK_AND_COLLECT"
                  ? "Click & collect"
                  : "Ireland delivery"}{" "}
                · {order.status.replaceAll("_", " ")}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-foreground/70">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity} × {item.title}{" "}
                    <span className="text-foreground/35">{item.sku}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {order.status === "PAID" ? (
                  <BigButton
                    disabled={pending === order.id}
                    onClick={() => void act(order.id, "processing")}
                  >
                    Start preparing
                  </BigButton>
                ) : null}
                {order.deliveryMethod === "CLICK_AND_COLLECT" &&
                order.status !== "READY_FOR_COLLECTION" ? (
                  <BigButton
                    disabled={pending === order.id}
                    onClick={() => void act(order.id, "ready")}
                  >
                    Ready to collect
                  </BigButton>
                ) : null}
                {order.deliveryMethod === "SHIP_IE" && order.status !== "SHIPPED" ? (
                  <BigButton
                    disabled={pending === order.id}
                    onClick={() => void act(order.id, "shipped")}
                  >
                    Mark dispatched
                  </BigButton>
                ) : null}
                {order.status === "READY_FOR_COLLECTION" || order.status === "SHIPPED" ? (
                  <BigButton
                    tone="quiet"
                    disabled={pending === order.id}
                    onClick={() => void act(order.id, "completed")}
                  >
                    Finish order
                  </BigButton>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </StaffShell>
  );
}
