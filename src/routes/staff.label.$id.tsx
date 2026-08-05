import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";

import { StaffShell } from "@/components/staff/StaffShell";
import { getProductLabel } from "@/lib/labels.server";

export const Route = createFileRoute("/staff/label/$id")({
  loader: ({ params }) => getProductLabel({ data: { id: params.id } }),
  head: () => ({
    meta: [{ title: "Item label — Bookmart back office" }, { name: "robots", content: "noindex" }],
  }),
  component: ProductLabel,
});

function ProductLabel() {
  const label = Route.useLoaderData();
  return (
    <StaffShell title="Item label" intro="Print this or keep it open while you label the shelf.">
      <section className="mx-auto max-w-sm bg-white p-6 text-center text-black print:max-w-none print:p-0">
        <p className="text-sm font-bold uppercase tracking-wide">Bookmart &amp; GameXchange</p>
        <img
          src={label.qrDataUrl}
          alt={`QR code for ${label.sku}`}
          className="mx-auto mt-4 aspect-square w-56"
        />
        <h1 className="mt-3 text-xl font-bold leading-tight">{label.title}</h1>
        <p className="mt-2 font-mono text-sm">{label.sku}</p>
        <p className="mt-2 text-lg font-bold">€{(label.priceMinor / 100).toFixed(2)}</p>
        <p className="mt-1 text-sm">Shelf: {label.shelfLocation}</p>
      </section>
      <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="shop-meta inline-flex min-h-12 items-center gap-2 rounded-sm bg-timber px-5 text-lamplight"
        >
          <Printer className="h-4 w-4" /> Print label
        </button>
        <Link
          to="/staff/stock"
          className="shop-meta inline-flex min-h-12 items-center px-5 text-brass"
        >
          Back to stock
        </Link>
      </div>
    </StaffShell>
  );
}
