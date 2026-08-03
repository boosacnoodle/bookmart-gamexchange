import { changeProductState, refundOrder, updateOrderStatus } from "@/app/management-actions";

export function ProductStateForm({ id, state }: { id: string; state: string }) {
  return (
    <form action={changeProductState} className="inline-form">
      <input type="hidden" name="id" value={id} />
      <select name="state" defaultValue={state}>
        {["DRAFT", "NEEDS_REVIEW", "READY", "PUBLISHED", "RESERVED", "SOLD", "ARCHIVED", "REJECTED"].map((item) => <option value={item} key={item}>{item}</option>)}
      </select>
      <button className="button button-secondary" type="submit">Update state</button>
    </form>
  );
}

export function OrderStatusForm({ id, status }: { id: string; status: string }) {
  return (
    <form action={updateOrderStatus} className="inline-form">
      <input type="hidden" name="id" value={id} />
      <select name="status" defaultValue={status}>
        {["PENDING_PAYMENT", "PAID", "PROCESSING", "READY_FOR_COLLECTION", "SHIPPED", "COMPLETED", "CANCELLED", "PAYMENT_FAILED", "REFUNDED", "PARTIALLY_REFUNDED"].map((item) => <option value={item} key={item}>{item}</option>)}
      </select>
      <input name="trackingNumber" placeholder="Tracking number" />
      <input name="staffNotes" placeholder="Internal note" />
      <button className="button button-secondary" type="submit">Save order</button>
    </form>
  );
}

export function RefundForm({ orderId, paidMinor }: { orderId: string; paidMinor: number }) {
  return (
    <form action={refundOrder} className="inline-form">
      <input type="hidden" name="orderId" value={orderId} />
      <input name="amountMajor" type="number" min="0.01" step="0.01" max={(paidMinor / 100).toFixed(2)} placeholder="Refund amount" />
      <input name="reason" placeholder="Reason required" />
      <button className="button button-secondary" type="submit">Record refund</button>
    </form>
  );
}
